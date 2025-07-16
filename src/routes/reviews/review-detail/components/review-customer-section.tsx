import { Container, Heading, Tooltip } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

export const ReviewCustomerSection = ({ customer }: { customer?: any }) => {
  const { t } = useTranslation()
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{t("reviews.customer")}</Heading>
      </div>
      <div className="px-6 py-4 grid grid-cols-2 text-sm">
        <p>{t("reviews.name")}</p>
        <p>{customer ? `${customer.first_name} ${customer.last_name}` : "-"}</p>
      </div>
      <div className="px-6 py-4 grid grid-cols-2 text-sm">
        <p>Email {t("reviews.manageYourReviews")}</p>
        <Tooltip content={<p>{customer ? `${customer.email}` : "-"}</p>}>
          <p className="truncate">{customer ? `${customer.email}` : "-"}</p>
        </Tooltip>
      </div>
    </Container>
  )
}
