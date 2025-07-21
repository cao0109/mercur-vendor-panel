import { useTranslation } from "react-i18next"

import { HttpTypes } from "@medusajs/types"
import { PlaceholderCell } from "../../common/placeholder-cell"

type VariantCellProps = {
  variants?: HttpTypes.AdminProductVariant[] | null
}

export const VariantCell = ({ variants }: VariantCellProps) => {
  const { t } = useTranslation()

  if (!variants || !variants.length) {
    return <PlaceholderCell />
  }

  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <span className="truncate">
        {t("products.variantCount_one", { count: variants.length })}
      </span>
    </div>
  )
}

export const VariantHeader = () => {
  const { t } = useTranslation()

  return (
    <div className="flex h-full w-full items-center">
      <span>{t("fields.variants")}</span>
    </div>
  )
}
