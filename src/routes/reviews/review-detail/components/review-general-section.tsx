import { ExclamationCircle } from "@medusajs/icons"
import { Badge, Button, Container, Heading } from "@medusajs/ui"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ActionMenu } from "../../../../components/common/action-menu"
import { StarsRating } from "../../../../components/common/stars-rating/stars-rating"
import { StatusCell } from "../../../../components/table/table-cells/review/status-cell"

export const ReviewGeneralSection = ({ review }: { review: any }) => {
  const { t } = useTranslation()
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{t("reviews.reviews")}</Heading>
        <div className="flex items-center gap-4">
          <Badge>
            <StatusCell status={review.seller_note} />
          </Badge>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: "Report review",
                    to: `/reviews/${review.id}/report`,
                    icon: <ExclamationCircle />,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
      <div className="px-6 py-4 grid grid-cols-2">
        <div>{t("reviews.stars")}</div>
        <div>
          <StarsRating rate={review.rating} />
        </div>
      </div>
      <div className="px-6 py-4 grid grid-cols-2">
        <div>{t("reviews.reviews")}</div>
        <div>{review.customer_note}</div>
      </div>
      <div className="px-6 py-4 grid grid-cols-2">
        <div>{t("reviews.reply")}</div>
        <div>{review.seller_note || "-"}</div>
      </div>
      <div className="px-6 py-4 grid grid-cols-2">
        <div>{t("reviews.added")}</div>
        <div>{format(review.created_at, "dd MMM yyyy")}</div>
      </div>
      <div className="px-6 py-4 flex justify-end">
        <Link to={`/reviews/${review.id}/reply`}>
          <Button className="px-6">
            {review.seller_note ? t("reviews.editReply") : t("reviews.reply")}
          </Button>
        </Link>
      </div>
    </Container>
  )
}
