import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { RouteModalProvider } from "../../../components/modals/route-modal-provider"
import { useRequest } from "../../../hooks/api"
import { ReviewReportForm } from "./components/review-report-form"

export const ReviewReport = () => {
  const { t } = useTranslation()
  const { id } = useParams()

  const { request, isLoading } = useRequest(id!)

  if (isLoading) return <div>{t("reviews.loading")}...</div>

  return (
    <RouteModalProvider prev={`/reviews/${id}`}>
      <ReviewReportForm request={request} />
    </RouteModalProvider>
  )
}
