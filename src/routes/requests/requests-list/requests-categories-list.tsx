import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { RequestListTable } from "./components/request-list-table"

export const RequestsCategoriesList = () => {
  const { getWidgets } = useDashboardExtension()
  const { t } = useTranslation()
  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("customer.list.after"),
        before: getWidgets("customer.list.before"),
      }}
    >
      <Container className="divided-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>{t("requests.categoriesRequests")}</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              {t("requests.addCategories")}
            </Text>
          </div>
          <Button variant="secondary" asChild>
            <Link to="create">{t("requests.requestsCategories")}</Link>
          </Button>
        </div>
        <div className="px-6 py-4">
          <RequestListTable request_type="product_category" />
        </div>
      </Container>
    </SingleColumnPage>
  )
}
