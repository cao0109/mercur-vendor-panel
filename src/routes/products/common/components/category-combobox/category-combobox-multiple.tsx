import {
  ArrowUturnLeft,
  EllipseMiniSolid,
  TriangleRightMini,
  TrianglesMini,
} from "@medusajs/icons"
import { AdminProductCategoryResponse } from "@medusajs/types"
import { Alert, Divider, Text, clx } from "@medusajs/ui"
import { Popover as RadixPopover } from "radix-ui"
import {
  CSSProperties,
  ComponentPropsWithoutRef,
  Fragment,
  MouseEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { Trans, useTranslation } from "react-i18next"
import { TextSkeleton } from "../../../../../components/common/skeleton"
import { useProductCategories } from "../../../../../hooks/api/categories"
import { useDebouncedSearch } from "../../../../../hooks/use-debounced-search"

// 新增标签组件接口，用于显示已选类别
interface Tag {
  id: string
  label: string
}

interface CategoryComboboxProps
  extends Omit<
    ComponentPropsWithoutRef<"input">,
    "value" | "defaultValue" | "onChange"
  > {
  value: string[] // 保持为字符串数组，但现在可以包含多个ID
  onChange: (value: string[]) => void
  enableOpen?: boolean
}

type Level = {
  id: string
  label: string
}

const TABLUAR_NUM_WIDTH = 8
const TAG_BASE_WIDTH = 28

export const CategoryComboboxMultiple = forwardRef<
  HTMLInputElement,
  CategoryComboboxProps
>(({ value, onChange, className, ...props }, ref) => {
  const innerRef = useRef<HTMLInputElement>(null)

  useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
    ref,
    () => innerRef.current,
    []
  )

  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<Tag[]>([]) // 新增：存储已选类别的标签信息
  const [showAlert, setShowAlert] = useState(false)
  const { i18n, t } = useTranslation()

  const [level, setLevel] = useState<Level[]>([])
  const { searchValue, onSearchValueChange, query } = useDebouncedSearch()

  const { product_categories, isPending, isError, error } =
    useProductCategories(
      {
        q: query,
        parent_category_id: !searchValue ? getParentId(level) : undefined,
        include_descendants_tree: !searchValue ? true : false,
      },
      {
        enabled: props.enableOpen || open,
      }
    )

  const [showLoading, setShowLoading] = useState(false)

  /**
   * 延迟加载状态结束，防止弹出框闪烁
   */
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (isPending) {
      setShowLoading(true)
    } else {
      timeoutId = setTimeout(() => {
        setShowLoading(false)
      }, 150)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isPending])

  /**
   * 搜索时清空层级
   */
  useEffect(() => {
    if (searchValue) {
      setLevel([])
    }
  }, [searchValue])

  /**
   * 搜索时清空标签（如果配置为搜索时清空选择）
   */
  useEffect(() => {
    if (searchValue && open) {
      // 可根据需求决定是否在搜索时清空已选标签
      // setTags([])
    }
  }, [searchValue, open])

  /**
   * 当value属性变化时更新标签显示
   */
  useEffect(() => {
    if (value && value.length > 0) {
      const newTags: Tag[] = []
      // 查找并设置已选类别的标签
      findTagsFromCategories(product_categories, value).forEach(tag => {
        if (!newTags.some(t => t.id === tag.id)) {
          newTags.push(tag)
        }
      })
      setTags(newTags)
    } else {
      setTags([])
    }
  }, [value, product_categories])

  function handleLevelUp(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    setLevel(level.slice(0, level.length - 1))

    innerRef.current?.focus()
  }

  function handleLevelDown(option: ProductCategoryOption) {
    return (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()

      setLevel([...level, { id: option.value, label: option.label }])

      innerRef.current?.focus()
    }
  }

  /**
   * 处理类别选择 - 现在支持多选
   */
  const handleSelect = (option: ProductCategoryOption) => {
    // 检查是否已选择该类别
    const isSelected = value.includes(option.value)
    
    // 如果已选择，则移除；否则，添加
    let newValues = isSelected 
      ? value.filter(id => id !== option.value) 
      : [...value, option.value]
    if (newValues.length > 10) {
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 3000)
      return;
    }
    onChange(newValues)
    
    // 不关闭下拉框，保持多选状态
    // handleOpenChange(false)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onSearchValueChange("")
      setLevel([])
    }

    if (open) {
      requestAnimationFrame(() => {
        innerRef.current?.focus()
      })
    }

    setOpen(open)
  }

  const options = getOptions(product_categories || [])

  const showTag = tags.length > 0
  const showSelected = !open && tags.length > 0

  /**
   * 计算标签区域宽度 - 支持多个标签
   */
  const tagWidth = useMemo(() => {
    const count = tags.length
    const digits = count.toString().length
    
    // 基础宽度加上每个标签的宽度和间距
    return TAG_BASE_WIDTH + digits * TABLUAR_NUM_WIDTH + (count * 80)
  }, [tags])

  const showLevelUp = !searchValue && level.length > 0

  const [focusedIndex, setFocusedIndex] = useState<number>(-1)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) {
        return
      }

      const optionsLength = showLevelUp ? options.length + 1 : options.length

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          const nextIndex = prev < optionsLength - 1 ? prev + 1 : prev
          return nextIndex
        })
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          return prev > 0 ? prev - 1 : prev
        })
      } else if (e.key === "ArrowRight") {
        const index = showLevelUp ? focusedIndex - 1 : focusedIndex
        const hasChildren = options[index]?.has_children

        if (!hasChildren || !!searchValue) {
          return
        }

        e.preventDefault()
        setLevel([
          ...level,
          {
            id: options[index].value,
            label: options[index].label,
          },
        ])
        setFocusedIndex(0)
      } else if (e.key === "Enter" && focusedIndex !== -1) {
        e.preventDefault()

        if (showLevelUp && focusedIndex === 0) {
          setLevel(level.slice(0, level.length - 1))
          setFocusedIndex(0)
          return
        }

        const index = showLevelUp ? focusedIndex - 1 : focusedIndex

        handleSelect(options[index])
      }
    },
    [open, focusedIndex, options, level, handleSelect, searchValue, showLevelUp]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  if (isError) {
    throw error
  }

  return (
    <div style={{position:'relative'}}>
       {showAlert && (
      <Alert variant="error" dismissible style={{position:'absolute', top: '0px', left: '30%', zIndex:999}}>
         <div>{t("validation.maxSelected", { value:10})}</div>
      </Alert>
      )}
      <RadixPopover.Root open={open} onOpenChange={handleOpenChange}>
      <RadixPopover.Anchor
        asChild
        onClick={() => {
          if (!open) {
            handleOpenChange(true)
          }
        }}
      >
        <div
          data-anchor
          className={clx(
            "relative flex cursor-pointer items-center gap-x-2 overflow-hidden",
            "h-8 w-full rounded-md",
            "bg-ui-bg-field transition-fg shadow-borders-base",
            "has-[input:focus]:shadow-borders-interactive-with-active",
            "has-[:invalid]:shadow-borders-error has-[[aria-invalid=true]]:shadow-borders-error",
            "has-[:disabled]:bg-ui-bg-disabled has-[:disabled]:text-ui-fg-disabled has-[:disabled]:cursor-not-allowed",
            {
              "shadow-borders-interactive-with-active": open,
            },
            className
          )}
          style={
            {
              "--tag-width": `${tagWidth}px`,
              display:'flex',
              height: '100%',
              minHeight: '32px'
            } as CSSProperties
          }
        >
          {(
            <div className=" flex" style={{display: 'flex',flexWrap: 'wrap'}}>
              {tags.map((tag, index) => (
                <div 
                  key={index} 
                  className="inline-flex items-center bg-ui-bg-accent text-ui-fg-accent rounded-full px-2 py-0.5 text-xs"
                >
                  {tag.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      // 移除已选标签
                      const newValues = value.filter(id => id !== tag.id)
                      onChange([...newValues])
                    }}
                    className="ml-1 text-ui-fg-accent hover:text-ui-fg-accent-hover"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={innerRef}
            value={searchValue}
            onChange={(e) => {
              onSearchValueChange(e.target.value)
            }}
            style={{
              width:0
            }}
            className={clx(
              "txt-compact-small size-full cursor-pointer appearance-none bg-transparent pr-8 outline-none",
              "hover:bg-ui-bg-field-hover",
              "focus:cursor-text",
              "placeholder:text-ui-fg-muted",
              {
                "pl-2": !showTag
              }
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => handleOpenChange(true)}
            className="text-ui-fg-muted transition-fg hover:bg-ui-bg-field-hover absolute right-0 flex size-8 items-center justify-center rounded-r outline-none"
          >
            <TrianglesMini className="text-ui-fg-muted" />
          </button>
        </div>
      </RadixPopover.Anchor>
      <RadixPopover.Content
        sideOffset={4}
        role="listbox"
        className={clx(
          "shadow-elevation-flyout bg-ui-bg-base -left-2 z-50 w-[var(--radix-popper-anchor-width)] rounded-[8px]",
          "max-h-[200px] overflow-y-auto",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        )}
        // 修改交互外部事件处理，仅在真正点击外部时关闭
        onInteractOutside={(e) => {
          e.preventDefault()

          const target = e.target as HTMLElement

          // 检查点击目标是否在下拉框内部
          if (target.closest("[data-anchor]") || target.closest("[role='listbox']")) {
            return
          }

          handleOpenChange(false)
        }}
      >
        {showLevelUp && (
          <Fragment>
            <div className="p-1">
              <button
                data-active={focusedIndex === 0}
                role="button"
                className={clx(
                  "transition-fg grid w-full appearance-none grid-cols-[20px_1fr] items-center justify-center gap-2 rounded-md px-2 py-1.5 text-left outline-none",
                  "data-[active=true]:bg-ui-bg-field-hover"
                )}
                type="button"
                onClick={handleLevelUp}
                onMouseEnter={() => setFocusedIndex(0)}
                onMouseLeave={() => setFocusedIndex(-1)}
                tabIndex={-1}
              >
                <ArrowUturnLeft className="text-ui-fg-muted" />
                <Text size="small" leading="compact">
                  {getParentLabel(level)}
                </Text>
              </button>
            </div>
            <Divider />
          </Fragment>
        )}
        <div className="p-1">
          {options.length > 0 &&
            !showLoading &&
            options.map((option, index) => (
              <div
                key={option.value}
                className={clx(
                  "transition-fg bg-ui-bg-base grid cursor-pointer grid-cols-1 items-center gap-2 overflow-hidden",
                  {
                    "grid-cols-[1fr_32px]": option.has_children && !searchValue,
                  }
                )}
              >
                <button
                  data-active={
                    showLevelUp
                      ? focusedIndex === index + 1
                      : focusedIndex === index
                  }
                  type="button"
                  role="option"
                  className={clx(
                    "grid h-full w-full appearance-none grid-cols-[20px_1fr] items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left outline-none",
                    "data-[active=true]:bg-ui-bg-field-hover",
                    // 为已选选项添加背景色
                    { "bg-ui-bg-accent/10": value.includes(option.value) }
                  )}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() =>
                    setFocusedIndex(showLevelUp ? index + 1 : index)
                  }
                  onMouseLeave={() => setFocusedIndex(-1)}
                  tabIndex={-1}
                >
                  <div className="flex size-5 items-center justify-center">
                    {isSelected(value, option.value) && <EllipseMiniSolid />}
                  </div>
                  <Text
                    as="span"
                    size="small"
                    leading="compact"
                    className="w-full truncate"
                  >
                    {option.label}
                  </Text>
                </button>
                {option.has_children && !searchValue && (
                  <button
                    className={clx(
                      "text-ui-fg-muted flex size-8 appearance-none items-center justify-center rounded-md outline-none",
                      "hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed"
                    )}
                    type="button"
                    onClick={handleLevelDown(option)}
                    tabIndex={-1}
                  >
                    <TriangleRightMini />
                  </button>
                )}
              </div>
            ))}
          {showLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[20px_1fr_20px] gap-2 px-2 py-1.5"
              >
                <div />
                <TextSkeleton size="small" leading="compact" />
                <div />
              </div>
            ))}
          {options.length === 0 && !showLoading && (
            <div className="px-2 py-1.5">
              <Text size="small" leading="compact">
                {query ? (
                  <Trans
                    i18n={i18n}
                    i18nKey={"general.noResultsTitle"}
                    tOptions={{
                      query: query,
                    }}
                    components={[<span className="font-medium" key="query" />]}
                  />
                ) : (
                  t("general.noResultsTitle")
                )}
              </Text>
            </div>
          )}
        </div>
      </RadixPopover.Content>
    </RadixPopover.Root>
    </div>
  )
})

CategoryComboboxMultiple.displayName = "CategoryComboboxMultiple"

type ProductCategoryOption = {
  value: string
  label: string
  has_children: boolean
}

function getParentId(level: Level[]): string {
  if (!level.length) {
    return "null"
  }

  return level[level.length - 1].id
}

function getParentLabel(level: Level[]): string | null {
  if (!level.length) {
    return null
  }

  return level[level.length - 1].label
}

function getOptions(
  categories: AdminProductCategoryResponse["product_category"][]
): ProductCategoryOption[] {
  return categories.map((cat) => {
    return {
      value: cat.id,
      label: cat.name,
      has_children: cat.category_children?.length > 0,
    }
  })
}

function isSelected(values: string[], value: string): boolean {
  return values.includes(value)
}

/**
 * 从类别数据中查找标签
 */
function findTagsFromCategories(
  categories: AdminProductCategoryResponse["product_category"][] | undefined,
  ids: string[]
): Tag[] {
  const tags: Tag[] = []
  
  if (!categories || !ids || ids.length === 0) {
    return tags
  }
  
  // 递归查找类别标签
  function findCategoryRecursive(cats: any[], targetIds: string[]): void {
    cats.forEach(cat => {
      if (targetIds.includes(cat.id)) {
        tags.push({ id: cat.id, label: cat.name })
      }
      if (cat.category_children && cat.category_children.length > 0) {
        findCategoryRecursive(cat.category_children, targetIds)
      }
    })
  }
  
  findCategoryRecursive(categories, ids)
  return tags
}