import { CheckCircleMiniSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Heading, StatusBadge, toast } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import "react-quill/dist/quill.snow.css"
import { useNavigate } from "react-router-dom"
import * as zod from "zod"
import { useExtendableForm } from "../../../../../extensions/forms/hooks"

import { useRef } from "react"

import ReactQuill from "react-quill"

import { ActionMenu } from "../../../../../components/common/action-menu"
import { useDashboardExtension } from "../../../../../extensions"
import { useUpdateProduct } from "../../../../../hooks/api/products"
import { uploadFilesQuery } from "../../../../../lib/client"
import { base64ToBlob } from "../../../product-create/components/product-create-rich-text-form"

const EditProductRichTextSchema = zod.object({
  title: zod.string().min(1),
  handle: zod.string().min(1),
  metadata: zod.object({
    details: zod.string().optional(),
  }),
})

const productStatusColor = (status: string) => {
  switch (status) {
    case "draft":
      return "grey"
    case "proposed":
      return "orange"
    case "published":
      return "green"
    case "rejected":
      return "red"
    default:
      return "grey"
  }
}

type ProductGeneralSectionProps = {
  product: HttpTypes.AdminProduct
  editable?: boolean
}

export const ProductRichTextSection = ({
  product,
  editable = true,
}: ProductGeneralSectionProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getFormConfigs } = useDashboardExtension()
  const configs = getFormConfigs("product", "edit")
  const setDetails = async (value: string) => {
    if (product && product.metadata) {
      product.metadata.details = value
    }
  }

  const form = useExtendableForm({
    defaultValues: {
      title: product.title || "",
      handle: product.handle || "",
      metadata:
        typeof product.metadata === "object" && product.metadata !== null
          ? product.metadata
          : {},
    },
    schema: EditProductRichTextSchema,
    configs: configs,
    data: product,
  })

  const { mutateAsync } = useUpdateProduct(product.id)

  const handleSubmit = async () => {
    const values = form.getValues()
    if (product?.metadata?.details) {
      const content = product?.metadata?.details
      const parser = new DOMParser()
      const doc = parser.parseFromString(
        typeof content === "string" ? content : "",
        "text/html"
      )
      const images = doc.querySelectorAll("img")
      for (const img of images) {
        const src = img.getAttribute("src")
        if (!src) {
          continue
        }
        if (src.startsWith("data:image")) {
          const blob = base64ToBlob(src, "image/png")
          const fileObject = {
            id: crypto.randomUUID(),
            url: URL.createObjectURL(blob),
            file: blob,
          }
          const response = await uploadFilesQuery([fileObject])

          img.setAttribute("src", response.files[0].url)
          img.setAttribute("data-key", response.files[0].id)
        }
      }
      product.metadata.details = doc.body.innerHTML
    }
    await mutateAsync(
      {
        handle: values.handle,
        metadata: {
          ...values.metadata,
          details: product?.metadata?.details || "",
        },
      },
      {
        onSuccess: ({ product }) => {
          toast.success(
            t("products.edit.successToast", {
              title: product.title,
            })
          )
          navigate(`/products/${product.id}`)
        },
        onError: (e) => {
          toast.error(e.message)
        },
      }
    )
  }

  const quillRef = useRef<ReactQuill>(null)

  const toolBarOptions = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["clean"],
  ]

  const modules = {
    toolbar: {
      container: toolBarOptions,
    },
  }

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "clean",
  ]

  return (
    <Container className="divide-y p-0 pb-20">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{t("products.create.tabs.richText")}</Heading>
        <div className="flex items-center gap-x-4">
          <StatusBadge color={productStatusColor(product.status)}>
            {t(`products.productStatus.${product.status}`)}
          </StatusBadge>
          {editable ? (
            <ActionMenu
              groups={[
                {
                  actions: [
                    {
                      label: t("actions.save"),
                      onClick: handleSubmit,
                      icon: <CheckCircleMiniSolid />,
                    },
                  ],
                },
              ]}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        modules={modules}
        formats={formats}
        style={{ height: "400px" }}
        value={
          typeof product?.metadata?.details === "string"
            ? product.metadata.details
            : ""
        }
        onChange={setDetails}
      />{" "}
    </Container>
  )
}
