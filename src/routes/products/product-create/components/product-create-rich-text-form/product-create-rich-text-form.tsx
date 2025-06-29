import { UseFormReturn } from "react-hook-form"
import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import "react-quill/dist/quill.snow.css"

import { useRef } from "react"

import ReactQuill from "react-quill"

import { ProductCreateSchemaType } from "../../types"

type ProductAttributesProps = {
  form: UseFormReturn<ProductCreateSchemaType>
}

export const ProductCreateRichTextForm = ({ form }: ProductAttributesProps) => {
  const setDetails = async (value: string) => {
    form.setValue("metadata.details", value)
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
    <div className="flex flex-col items-center p-16">
      <div className="flex w-full max-w-[720px] flex-col gap-y-8">
        <Header />
        <div className="flex flex-col gap-y-6">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            modules={modules}
            formats={formats}
            style={{ height: "400px" }}
            value={form.watch("metadata.details")}
            onChange={setDetails}
          />{" "}
        </div>
      </div>
    </div>
  )
}

const Header = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col">
      <Heading>{t("products.create.tabs.richText")}</Heading>
    </div>
  )
}

export function base64ToBlob(
  base64String: string,
  mimeType: string = ""
): Blob {
  const byteCharacters = atob(base64String.split(",")[1]) // 如果 Base64 包含头部信息
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}
