import { HttpTypes } from "@medusajs/types"
import { Button, ProgressStatus, ProgressTabs, toast } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  RouteFocusModal,
  useRouteModal,
} from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import {
  useDashboardExtension,
  useExtendableForm,
} from "../../../../../extensions"
import { useCreateProduct } from "../../../../../hooks/api"
import { uploadFilesQuery } from "../../../../../lib/client"
import { generateHandle } from "../../../../../utils/handle-generator"
import {
  PRODUCT_CREATE_FORM_DEFAULTS,
  ProductCreateSchema,
} from "../../constants"
import { ProductCreateDetailsForm } from "../product-create-details-form"
import { ProductCreateInventoryKitForm } from "../product-create-inventory-kit-form"
import { ProductCreateOrganizeForm } from "../product-create-organize-form"
import {
  ProductCreateRichTextForm,
  base64ToBlob,
} from "../product-create-rich-text-form"
import { ProductCreateVariantsForm } from "../product-create-variants-form"
import { usePricePreferences } from "../../../../../hooks/api/price-preferences"
import { useRegions } from "../../../../../hooks/api"
import { ProductCreateAttributesForm } from "../product-create-attributes-form"

enum Tab {
  DETAILS = "details",
  ORGANIZE = "organize",
  VARIANTS = "variants",
  INVENTORY = "inventory",
  ATTRIBUTES = "attributes",
  RICHTEXT = "rich_text",
}

type TabState = Record<Tab, ProgressStatus>

const SAVE_DRAFT_BUTTON = "save-draft-button"
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

type ProductCreateFormProps = {
  defaultChannel?: HttpTypes.AdminSalesChannel
  store?: HttpTypes.AdminStore
  pricePreferences?: HttpTypes.AdminPricePreference[]
}

export const ProductCreateForm = ({
  defaultChannel,
  store,
}: ProductCreateFormProps) => {
  const [tab, setTab] = useState<Tab>(Tab.DETAILS)
  const [tabState, setTabState] = useState<TabState>({
    [Tab.DETAILS]: "in-progress",
    [Tab.ORGANIZE]: "not-started",
    [Tab.VARIANTS]: "not-started",
    [Tab.INVENTORY]: "not-started",
    [Tab.ATTRIBUTES]: "not-started",
    [Tab.RICHTEXT]: "not-started",
  })

  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const { getFormConfigs } = useDashboardExtension()
  const configs = getFormConfigs("product", "create")
  const [isCreateLoading, setIsCreateLoading] = useState(false)

  const { regions } = useRegions({ limit: 9999 })
  const { price_preferences: pricePreferences } = usePricePreferences({
    limit: 9999,
  })

  const form = useExtendableForm({
    defaultValues: {
      ...PRODUCT_CREATE_FORM_DEFAULTS,
      sales_channels: defaultChannel
        ? [
            {
              id: defaultChannel.id,
              name: defaultChannel.name,
            },
          ]
        : [],
    },
    schema: ProductCreateSchema,
    configs,
  })

  const { mutateAsync, isPending } = useCreateProduct()

  /**
   * TODO: Important to revisit this - use variants watch so high in the tree can cause needless rerenders of the entire page
   * which is suboptimal when rerenders are caused by bulk editor changes
   */

  const watchedVariants = useWatch({
    control: form.control,
    name: "variants",
  })

  const showInventoryTab = useMemo(
    () => watchedVariants.some((v) => v.manage_inventory && v.inventory_kit),
    [watchedVariants]
  )

  const handleSubmit = form.handleSubmit(async (values, e) => {
    setIsCreateLoading(true)
    let isDraftSubmission = false

    if (e?.nativeEvent instanceof SubmitEvent) {
      const submitter = e?.nativeEvent?.submitter as HTMLButtonElement
      isDraftSubmission = submitter.dataset.name === SAVE_DRAFT_BUTTON
    }

    const media = values.media || []
    const payload = { ...values, media: undefined }

    console.log("Submitting product create form", payload)

    // 如果 handle 为空，根据标题生成
    if (!payload.handle) {
      payload.handle = await generateHandle(payload.title)
    }

    // 处理富文本编辑器内容
    if (payload.metadata?.details) {
      const content = payload.metadata?.details
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, "text/html")
      const images = doc.querySelectorAll("img")
      for (const img of images) {
        const src = img.getAttribute("src")
        if (!src) {
          continue
        }
        if (src.startsWith("data:image")) {
          console.error("Invalid Base64 string:", src)
          const blob = base64ToBlob(src, "image/png")
          console.log("Uploading image", blob)

          // 检查文件大小是否超过5MB
          if (blob.size > MAX_FILE_SIZE_BYTES) {
            toast.warning(
              `富文本中的图片大小超过${MAX_FILE_SIZE_MB}MB，可能会上传失败，请考虑压缩后再上传。`
            )
          }

          const fileObject = {
            id: crypto.randomUUID(),
            url: URL.createObjectURL(blob),
            file: blob,
          }
          const response = await uploadFilesQuery([fileObject])

          console.log("Image upload response", response.files[0].url)
          img.setAttribute("src", response.files[0].url)
          img.setAttribute("data-key", response.files[0].id)
        }
      }
      payload.metadata.details = doc.body.innerHTML
    }

    let uploadedMedia: (HttpTypes.AdminFile & {
      isThumbnail: boolean
    })[] = []
    try {
      if (media.length) {
        // 检查单个文件大小是否超过5MB
        const isMoreThanMaxSize = media.some((element) => {
          return element.file && element.file.size > MAX_FILE_SIZE_BYTES
        })

        if (isMoreThanMaxSize) {
          toast.warning(
            `文件大小超过${MAX_FILE_SIZE_MB}MB，可能会上传失败，请考虑压缩后再上传。`
          )
        }

        const thumbnailReq = media.filter((m) => m.isThumbnail)
        const otherMediaReq = media.filter((m) => !m.isThumbnail)

        const fileReqs = []
        if (thumbnailReq?.length) {
          fileReqs.push(
            uploadFilesQuery(thumbnailReq).then((r: any) =>
              r.files.map((f: any) => ({
                ...f,
                isThumbnail: true,
              }))
            )
          )
        }
        if (otherMediaReq?.length) {
          // 图片总大小大于5M实现分组上传
          // 计算文件总大小
          const totalSize = otherMediaReq.reduce((sum: number, file: any) => {
            return sum + (file.file?.size || 0)
          }, 0)
          // 检查文件总大小是否超过5MB
          if (totalSize > MAX_FILE_SIZE_BYTES) {
            // 需要分组上传
            const chunks: any[][] = []
            let currentChunk: any[] = []
            let currentChunkSize = 0

            for (const file of otherMediaReq) {
              const fileSize = file.file?.size || 0

              // 如果当前文件大小超过单个分组限制，单独处理
              if (fileSize > MAX_FILE_SIZE_BYTES) {
                // 先将当前组添加到 chunks
                if (currentChunk.length > 0) {
                  chunks.push(currentChunk)
                  currentChunk = []
                  currentChunkSize = 0
                }
                // 大文件单独成组
                chunks.push([file])
              } else if (currentChunkSize + fileSize > MAX_FILE_SIZE_BYTES) {
                // 当前组已满，添加到 chunks 并创建新组
                chunks.push(currentChunk)
                currentChunk = [file]
                currentChunkSize = fileSize
              } else {
                // 添加到当前组
                currentChunk.push(file)
                currentChunkSize += fileSize
              }
            }

            // 添加最后一个组
            if (currentChunk.length > 0) {
              chunks.push(currentChunk)
            }

            // 为每个组创建上传请求
            chunks.forEach((chunk) => {
              fileReqs.push(
                uploadFilesQuery(chunk).then((r: any) =>
                  r.files.map((f: any) => ({
                    ...f,
                    isThumbnail: false,
                  }))
                )
              )
            })
          } else {
            // 不需要分组，直接上传
            fileReqs.push(
              uploadFilesQuery(otherMediaReq).then((r: any) =>
                r.files.map((f: any) => ({
                  ...f,
                  isThumbnail: false,
                }))
              )
            )
          }
        }

        uploadedMedia = (await Promise.all(fileReqs)).flat()
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }

    await mutateAsync(
      {
        ...payload,
        status: isDraftSubmission ? "draft" : "proposed",
        images: uploadedMedia,
        weight: parseInt(payload.weight || "") || undefined,
        length: parseInt(payload.length || "") || undefined,
        height: parseInt(payload.height || "") || undefined,
        width: parseInt(payload.width || "") || undefined,
        type_id: payload.type_id || undefined,
        tags:
          payload.tags?.map((tag) => ({
            id: tag,
          })) || [],
        collection_id: payload.collection_id || undefined,
        shipping_profile_id: undefined,
        enable_variants: undefined,
        additional_data: undefined,
        categories: payload.categories.map((cat) => ({
          id: cat,
        })),
        variants: payload.variants.map((variant) => ({
          ...variant,
          sku: variant.sku === "" ? undefined : variant.sku,
          manage_inventory: true,
          allow_backorder: false,
          should_create: undefined,
          is_default: undefined,
          inventory_kit: undefined,
          inventory: undefined,
          weight: parseInt(payload.weight || "") || undefined,
          length: parseInt(payload.length || "") || undefined,
          height: parseInt(payload.height || "") || undefined,
          width: parseInt(payload.width || "") || undefined,
          origin_country: payload.origin_country || undefined,
          hs_code: payload.hs_code || undefined,
          mid_code: payload.mid_code || undefined,
          prices: Object.keys(variant.prices || {}).map((key) => ({
            currency_code: key,
            amount: parseFloat(variant.prices?.[key] as string),
          })),
        })),
      },
      {
        onSuccess: (data) => {
          toast.success(
            t("products.create.successToast", {
              title: data.product.title,
            })
          )

          handleSuccess(`../${data.product.id}`)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
    setIsCreateLoading(false)
  })

  // 根据不同标签页定义需要验证的字段
  const getTabFields = (tab: Tab): any[] => {
    switch (tab) {
      case Tab.DETAILS:
        return ["title", "description", "type_id", "status"]
      case Tab.ORGANIZE:
        return ["categories", "collection_id", "tags"]
      case Tab.ATTRIBUTES:
        return [
          "width",
          "height",
          "length",
          "weight",
          "mid_code",
          "hs_code",
          "origin_country",
        ]
      case Tab.VARIANTS:
        return ["variants"]
      case Tab.INVENTORY:
        return ["inventory_kit"]
      case Tab.RICHTEXT:
        return ["rich_text"]
      default:
        return []
    }
  }

  const onNext = async (currentTab: Tab) => {
    const fields = getTabFields(currentTab)
    const valid = await form.trigger(fields)

    if (!valid) {
      return
    }

    if (currentTab === Tab.DETAILS) {
      setTab(Tab.ORGANIZE)
    }

    if (currentTab === Tab.ORGANIZE) {
      setTab(Tab.ATTRIBUTES)
    }

    if (currentTab === Tab.ATTRIBUTES) {
      setTab(Tab.VARIANTS)
    }

    // if (currentTab === Tab.VARIANTS) {
    //   setTab(Tab.INVENTORY)
    // }

    if (currentTab === Tab.VARIANTS) {
      setTab(Tab.RICHTEXT)
    }
  }

  useEffect(() => {
    const currentState = { ...tabState }
    if (tab === Tab.DETAILS) {
      currentState[Tab.DETAILS] = "in-progress"
    }
    if (tab === Tab.ORGANIZE) {
      currentState[Tab.DETAILS] = "completed"
      currentState[Tab.ORGANIZE] = "in-progress"
    }
    if (tab === Tab.ATTRIBUTES) {
      currentState[Tab.DETAILS] = "completed"
      currentState[Tab.ORGANIZE] = "completed"
      currentState[Tab.ATTRIBUTES] = "in-progress"
    }
    if (tab === Tab.VARIANTS) {
      currentState[Tab.DETAILS] = "completed"
      currentState[Tab.ORGANIZE] = "completed"
      currentState[Tab.ATTRIBUTES] = "completed"
      currentState[Tab.VARIANTS] = "in-progress"
    }
    if (tab === Tab.INVENTORY) {
      currentState[Tab.DETAILS] = "completed"
      currentState[Tab.ORGANIZE] = "completed"
      currentState[Tab.ATTRIBUTES] = "completed"
      currentState[Tab.VARIANTS] = "completed"
      currentState[Tab.INVENTORY] = "in-progress"
    }
    if (tab === Tab.RICHTEXT) {
      currentState[Tab.DETAILS] = "completed"
      currentState[Tab.ORGANIZE] = "completed"
      currentState[Tab.ATTRIBUTES] = "completed"
      currentState[Tab.VARIANTS] = "completed"
      currentState[Tab.INVENTORY] = "completed"
      currentState[Tab.RICHTEXT] = "in-progress"
    }

    setTabState({ ...currentState })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want this effect to run when the tab changes
  }, [tab])

  return (
    <RouteFocusModal.Form form={form}>
      <KeyboundForm
        onKeyDown={(e) => {
          // We want to continue to the next tab on enter instead of saving as draft immediately
          if (e.key === "Enter") {
            if (
              e.target instanceof HTMLTextAreaElement &&
              !(e.metaKey || e.ctrlKey)
            ) {
              return
            }

            e.preventDefault()

            if (e.metaKey || e.ctrlKey) {
              if (tab !== Tab.RICHTEXT) {
                e.preventDefault()
                e.stopPropagation()
                onNext(tab)

                return
              }

              handleSubmit()
            }
          }
        }}
        onSubmit={handleSubmit}
        className="flex h-full flex-col"
      >
        <ProgressTabs
          value={tab}
          onValueChange={async (newTab) => {
            // 只验证当前标签页的字段，而不是整个表单
            const fields = getTabFields(tab)
            const valid = await form.trigger(fields)

            if (!valid) {
              return
            }

            setTab(newTab as Tab)
          }}
          className="flex h-full flex-col overflow-hidden"
        >
          <RouteFocusModal.Header>
            <div className="-my-2 w-full border-l">
              <ProgressTabs.List className="justify-start-start flex w-full items-center">
                <ProgressTabs.Trigger
                  status={tabState[Tab.DETAILS]}
                  value={Tab.DETAILS}
                  className="max-w-[200px] truncate"
                >
                  {t("products.create.tabs.details")}
                </ProgressTabs.Trigger>
                <ProgressTabs.Trigger
                  status={tabState[Tab.ORGANIZE]}
                  value={Tab.ORGANIZE}
                  className="max-w-[200px] truncate"
                >
                  {t("products.create.tabs.organize")}
                </ProgressTabs.Trigger>
                <ProgressTabs.Trigger
                  status={tabState[Tab.ATTRIBUTES]}
                  value={Tab.ATTRIBUTES}
                  className="max-w-[200px] truncate"
                >
                  {t("products.create.tabs.attributes")}
                </ProgressTabs.Trigger>
                <ProgressTabs.Trigger
                  status={tabState[Tab.VARIANTS]}
                  value={Tab.VARIANTS}
                  className="max-w-[200px] truncate"
                >
                  {t("products.create.tabs.variants")}
                </ProgressTabs.Trigger>
                {showInventoryTab && (
                  <ProgressTabs.Trigger
                    status={tabState[Tab.INVENTORY]}
                    value={Tab.INVENTORY}
                    className="max-w-[200px] truncate"
                  >
                    {t("products.create.tabs.inventory")}
                  </ProgressTabs.Trigger>
                )}
                <ProgressTabs.Trigger
                  status={tabState[Tab.RICHTEXT]}
                  value={Tab.RICHTEXT}
                  className="max-w-[200px] truncate"
                >
                  {t("products.create.tabs.richText")}
                </ProgressTabs.Trigger>
              </ProgressTabs.List>
            </div>
          </RouteFocusModal.Header>
          <RouteFocusModal.Body className="size-full overflow-hidden">
            <ProgressTabs.Content
              className="size-full overflow-y-auto"
              value={Tab.DETAILS}
            >
              <ProductCreateDetailsForm form={form} />
            </ProgressTabs.Content>
            <ProgressTabs.Content
              className="size-full overflow-y-auto"
              value={Tab.ORGANIZE}
            >
              <ProductCreateOrganizeForm form={form} />
            </ProgressTabs.Content>
            <ProgressTabs.Content
              className="size-full overflow-y-auto"
              value={Tab.ATTRIBUTES}
            >
              <ProductCreateAttributesForm form={form} />
            </ProgressTabs.Content>
            <ProgressTabs.Content
              className="size-full overflow-y-auto"
              value={Tab.VARIANTS}
            >
              <ProductCreateVariantsForm
                form={form}
                store={store}
                regions={regions}
                pricePreferences={pricePreferences}
              />
            </ProgressTabs.Content>
            {showInventoryTab && (
              <ProgressTabs.Content
                className="size-full overflow-y-auto"
                value={Tab.INVENTORY}
              >
                <ProductCreateInventoryKitForm form={form} />
              </ProgressTabs.Content>
            )}
            <ProgressTabs.Content
              className="size-full overflow-y-auto"
              value={Tab.RICHTEXT}
            >
              <ProductCreateRichTextForm form={form} />
            </ProgressTabs.Content>
          </RouteFocusModal.Body>
        </ProgressTabs>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button variant="secondary" size="small">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button
              data-name={SAVE_DRAFT_BUTTON}
              size="small"
              type="submit"
              isLoading={isPending || isCreateLoading}
              className="whitespace-nowrap"
            >
              {t("fields.draft")}
            </Button>
            <PrimaryButton
              tab={tab}
              next={onNext}
              isLoading={isPending || isCreateLoading}
              showInventoryTab={showInventoryTab}
            />
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}

type PrimaryButtonProps = {
  tab: Tab
  next: (tab: Tab) => void
  isLoading?: boolean
  showInventoryTab: boolean
}

const PrimaryButton = ({
  tab,
  next,
  isLoading,
  showInventoryTab,
}: PrimaryButtonProps) => {
  const { t } = useTranslation()

  if (tab === Tab.RICHTEXT) {
    return (
      <Button
        data-name="publish-button"
        key="submit-button"
        type="submit"
        variant="primary"
        size="small"
        isLoading={isLoading}
      >
        Create Product
      </Button>
    )
  }

  return (
    <Button
      key="next-button"
      type="button"
      variant="primary"
      size="small"
      onClick={() => next(tab)}
    >
      {t("actions.continue")}
    </Button>
  )
}
