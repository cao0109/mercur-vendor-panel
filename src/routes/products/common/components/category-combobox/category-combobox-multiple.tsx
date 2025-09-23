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

interface Tag {
  id: string
  label: string
}

interface CategoryComboboxProps
  extends Omit<
    ComponentPropsWithoutRef<"input">,
    "value" | "defaultValue" | "onChange"
  > {
  value: string[]
  onChange: (value: string[]) => void
  enableOpen?: boolean
}

type Level = {
  id: string
  label: string
}

const TAG_BASE_WIDTH = 28
const MAX_VISIBLE_TAGS = 5 // 超过显示数量提示

export const CategoryComboboxMultiple = forwardRef<
  HTMLInputElement,
  CategoryComboboxProps
>(({ value, onChange, className, ...props }, ref) => {
  const innerRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => innerRef.current!, [])

  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const { i18n, t } = useTranslation()

  const [level, setLevel] = useState<Level[]>([])
  const { searchValue, onSearchValueChange, query } = useDebouncedSearch()

  // 获取当前层级数据
  const { product_categories, isPending, isError, error } =
    useProductCategories(
      {
        q: query,
        parent_category_id: !searchValue ? getParentId(level) : undefined,
        include_descendants_tree: !searchValue ? true : false,
      },
      { enabled: props.enableOpen || open }
    )

  // 核心优化：维护全量类别数据缓存（包含所有层级已加载的类别）
  const [allCategories, setAllCategories] = useState<
    AdminProductCategoryResponse["product_category"][]
  >([])

  // 将新加载的类别数据合并到全量缓存（去重）
  useEffect(() => {
    if (product_categories && product_categories.length) {
      setAllCategories((prev) => {
        const newCats = product_categories.filter(
          (cat) => !prev.some((existing) => existing.id === cat.id)
        )
        return [...prev, ...newCats]
      })
    }
  }, [product_categories])

  const [showLoading, setShowLoading] = useState(false)

  // 延迟加载状态处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(isPending)
    }, 150)
    return () => clearTimeout(timer)
  }, [isPending])

  // 搜索时重置层级
  useEffect(() => {
    if (searchValue) setLevel([])
  }, [searchValue])

  // 优化标签生成：基于全量缓存数据，而非当前层级数据
  useEffect(() => {
    if (value.length === 0) {
      setTags([])
      return
    }
    // 从全量缓存中查找所有已选项的标签
    const newTags = findTagsFromCategories(allCategories, value)
    setTags(newTags)
  }, [value, allCategories]) // 依赖全量缓存，而非临时的product_categories

  // 层级导航：返回上一级
  function handleLevelUp(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    setLevel(level.slice(0, -1))
    innerRef.current?.focus()
  }

  // 层级导航：进入下一级
  function handleLevelDown(option: ProductCategoryOption) {
    return (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setLevel([...level, { id: option.value, label: option.label }])
      innerRef.current?.focus()
    }
  }

  // 处理类别选择（多选逻辑）
  const handleSelect = (option: ProductCategoryOption) => {
    const isSelected = value.includes(option.value)
    const newValues = isSelected
      ? value.filter((id) => id !== option.value)
      : [...value, option.value]

    if (newValues.length > 10) {
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }
    onChange(newValues)
  }

  // 下拉框开关
  function handleOpenChange(open: boolean) {
    if (!open) {
      onSearchValueChange("")
      setLevel([])
    } else {
      requestAnimationFrame(() => innerRef.current?.focus())
    }
    setOpen(open)
  }

  const options = getOptions(product_categories || [])
  const showTag = tags.length > 0

  // 优化标签宽度计算（支持换行）
  const tagContainerStyle = useMemo(
    () => ({
      display: "flex",
      flexWrap: "wrap",
      gap: "4px",
      width: "100%",
      padding: "2px 0",
    }),
    []
  )

  const showLevelUp = !searchValue && level.length > 0
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)

  // 键盘导航逻辑
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return

      const optionsLength = showLevelUp ? options.length + 1 : options.length

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedIndex((prev) => Math.min(prev + 1, optionsLength - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex((prev) => Math.max(prev - 1, 0))
          break
        case "ArrowRight": {
          const index = showLevelUp ? focusedIndex - 1 : focusedIndex
          if (options[index]?.has_children && !searchValue) {
            e.preventDefault()
            setLevel([
              ...level,
              { id: options[index].value, label: options[index].label },
            ])
            setFocusedIndex(0)
          }
          break
        }
        case "Enter":
          if (focusedIndex === -1) return
          e.preventDefault()
          if (showLevelUp && focusedIndex === 0) {
            handleLevelUp(e as unknown as MouseEvent<HTMLButtonElement>)
          } else {
            const index = showLevelUp ? focusedIndex - 1 : focusedIndex
            handleSelect(options[index])
          }
          break
        case "Escape":
          handleOpenChange(false)
          break
      }
    },
    [open, focusedIndex, options, level, handleSelect, searchValue, showLevelUp]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (isError) throw error

  return (
    <div style={{ position: "relative" }}>
      {showAlert && (
        <Alert
          variant="error"
          dismissible
          style={{
            position: "absolute",
            top: "-40px",
            left: 0,
            zIndex: 999,
          }}
        >
          <div>{t("validation.maxSelected", { value: 10 })}</div>
        </Alert>
      )}

      <RadixPopover.Root open={open} onOpenChange={handleOpenChange}>
        <RadixPopover.Anchor
          asChild
          onClick={() => !open && handleOpenChange(true)}
        >
          <div
            data-anchor
            className={clx(
              "relative flex cursor-pointer items-center gap-x-2",
              "h-auto min-h-[32px] w-full rounded-md", // 改为自动高度，支持多行标签
              "bg-ui-bg-field transition-fg shadow-borders-base",
              "has-[input:focus]:shadow-borders-interactive-with-active",
              "has-[:invalid]:shadow-borders-error",
              "has-[:disabled]:bg-ui-bg-disabled has-[:disabled]:cursor-not-allowed",
              { "shadow-borders-interactive-with-active": open },
              className
            )}
            style={{ padding: "4px" } as CSSProperties} // 增加内边距
          >
            {/* 标签回显区域（支持换行） */}
            {/* eslint-disable-next-line */}
            <div style={tagContainerStyle}>
              {tags.map((tag) => (
                <div
                  key={tag.id} // 用id作为key，避免重复渲染
                  className="inline-flex items-center bg-ui-bg-accent text-ui-fg-accent rounded-full px-2 py-0.5 text-xs"
                >
                  {tag.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onChange(value.filter((id) => id !== tag.id))
                    }}
                    className="ml-1 text-ui-fg-accent hover:text-ui-fg-accent-hover"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* 搜索输入框 */}
              {/* <input
                ref={innerRef}
                value={searchValue}
                onChange={(e) => onSearchValueChange(e.target.value)}
                className={clx(
                  "txt-compact-small flex-grow appearance-none bg-transparent outline-none",
                  "hover:bg-ui-bg-field-hover focus:cursor-text",
                  "placeholder:text-ui-fg-muted",
                  { "min-width": "80px" } // 避免输入框过窄
                )}
                {...props}
              /> */}
            </div>

            {/* 下拉按钮 */}
            <button
              type="button"
              onClick={() => handleOpenChange(true)}
              className="text-ui-fg-muted hover:bg-ui-bg-field-hover absolute right-0 flex h-8 w-8 items-center justify-center rounded-r outline-none"
            >
              <TrianglesMini />
            </button>
          </div>
        </RadixPopover.Anchor>

        {/* 下拉选项面板 */}
        <RadixPopover.Content
          sideOffset={4}
          role="listbox"
          className={clx(
            "shadow-elevation-flyout bg-ui-bg-base -left-2 z-50 w-[var(--radix-popper-anchor-width)] rounded-[8px]",
            "max-h-[200px] overflow-y-auto",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2"
          )}
          onInteractOutside={(e) => {
            e.preventDefault()
            // eslint-disable-next-line
            if (
              !e?.target?.closest("[data-anchor]") &&
              !e?.target?.closest("[role='listbox']")
            ) {
              handleOpenChange(false)
            }
          }}
        >
          {showLevelUp && (
            <Fragment>
              <div className="p-1">
                <button
                  data-active={focusedIndex === 0}
                  onClick={handleLevelUp}
                  onMouseEnter={() => setFocusedIndex(0)}
                  onMouseLeave={() => setFocusedIndex(-1)}
                  className={clx(
                    "grid w-full grid-cols-[20px_1fr] items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none",
                    "data-[active=true]:bg-ui-bg-field-hover"
                  )}
                  tabIndex={-1}
                >
                  <ArrowUturnLeft className="text-ui-fg-muted" />
                  <Text size="small">{getParentLabel(level)}</Text>
                </button>
              </div>
              <Divider />
            </Fragment>
          )}

          <div className="p-1">
            {options.length > 0 && !showLoading ? (
              options.map((option, index) => (
                <div
                  key={option.value} // 用id作为key
                  className={clx(
                    "transition-fg bg-ui-bg-base grid cursor-pointer grid-cols-1 items-center gap-2",
                    {
                      "grid-cols-[1fr_32px]":
                        option.has_children && !searchValue,
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
                      "grid h-full w-full grid-cols-[20px_1fr] items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none",
                      "data-[active=true]:bg-ui-bg-field-hover",
                      { "bg-ui-bg-accent/10": value.includes(option.value) } // 已选项高亮
                    )}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() =>
                      setFocusedIndex(showLevelUp ? index + 1 : index)
                    }
                    onMouseLeave={() => setFocusedIndex(-1)}
                    tabIndex={-1}
                  >
                    <div className="flex h-5 w-5 items-center justify-center">
                      {value.includes(option.value) && <EllipseMiniSolid />}
                    </div>
                    <Text size="small" className="truncate">
                      {option.label}
                    </Text>
                  </button>

                  {option.has_children && !searchValue && (
                    <button
                      onClick={handleLevelDown(option)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-ui-fg-muted hover:bg-ui-bg-base-hover"
                      tabIndex={-1}
                    >
                      <TriangleRightMini />
                    </button>
                  )}
                </div>
              ))
            ) : showLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[20px_1fr_20px] gap-2 px-2 py-1.5"
                >
                  <div />
                  <TextSkeleton size="small" />
                  <div />
                </div>
              ))
            ) : (
              <div className="px-2 py-1.5">
                <Text size="small">
                  {query ? (
                    <Trans
                      i18nKey="general.noResultsTitle"
                      tOptions={{ query }}
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

// 工具函数与类型定义
type ProductCategoryOption = {
  value: string
  label: string
  has_children: boolean
}

function getParentId(level: Level[]): string {
  return level.length ? level[level.length - 1].id : "null"
}

function getParentLabel(level: Level[]): string | null {
  return level.length ? level[level.length - 1].label : null
}

function getOptions(
  categories: AdminProductCategoryResponse["product_category"][]
): ProductCategoryOption[] {
  return categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    has_children: cat.category_children?.length > 0,
  }))
}

function isSelected(values: string[], value: string): boolean {
  return values.includes(value)
}

// 从全量缓存中查找标签（递归查找所有层级）
function findTagsFromCategories(
  categories: AdminProductCategoryResponse["product_category"][] | undefined,
  ids: string[]
): Tag[] {
  const tags: Tag[] = []
  if (!categories || !ids.length) return tags

  function findRecursive(
    cats: AdminProductCategoryResponse["product_category"][]
  ) {
    cats.forEach((cat) => {
      if (ids.includes(cat.id)) {
        tags.push({ id: cat.id, label: cat.name })
      }
      if (cat.category_children && cat.category_children.length) {
        findRecursive(cat.category_children)
      }
    })
  }

  findRecursive(categories)
  // 保持与ids相同的顺序
  return ids.map((id) => tags.find((t) => t.id === id)).filter(Boolean) as Tag[]
}
