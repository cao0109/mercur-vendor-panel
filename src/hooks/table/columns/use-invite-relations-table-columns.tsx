import { Badge } from "@medusajs/ui"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import type {
  InviteRelationStatus,
  VendorInviteRelationDTO,
} from "../../../types/invite-codes"

const columnHelper = createColumnHelper<VendorInviteRelationDTO>()

export const useInviteRelationsTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.display({
        id: "invited_user",
        header: t("inviteCodes.relations.columns.invitedUser"),
        cell: (info) => {
          const relation = info.row.original
          const userName = relation.customer
            ? `${relation.customer.first_name || ""} ${relation.customer.last_name || ""}`.trim()
            : relation.seller?.name
          const userEmail = relation.customer?.email || relation.seller?.email

          return (
            <div className="flex flex-col gap-1">
              {userName && (
                <span className="font-medium text-ui-fg-base">{userName}</span>
              )}
              {userEmail && (
                <span className="text-xs text-ui-fg-subtle">{userEmail}</span>
              )}
              {!userName && !userEmail && (
                <span className="text-ui-fg-muted italic">-</span>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor("invited_type", {
        header: t("inviteCodes.relations.columns.type"),
        cell: (info) => {
          const type = info.getValue()
          return (
            <Badge size="small" color={type === "buyer" ? "green" : "purple"}>
              {type === "buyer" ? t("inviteCodes.relations.types.buyer") : t("inviteCodes.relations.types.seller")}
            </Badge>
          )
        },
      }),
      columnHelper.accessor("status", {
        header: t("inviteCodes.relations.columns.status"),
        cell: (info) => {
          const status = info.getValue()
          const config: Record<
            InviteRelationStatus,
            { color: "green" | "blue" | "grey" }
          > = {
            active: { color: "green" },
            completed: { color: "blue" },
            cancelled: { color: "grey" },
          }
          const { color } = config[status] || config.active
          return (
            <Badge size="small" color={color}>
              {t(`inviteCodes.relations.status.${status}`)}
            </Badge>
          )
        },
      }),
      columnHelper.accessor("created_at", {
        header: t("inviteCodes.relations.columns.inviteTime"),
        cell: (info) => {
          return new Date(info.getValue()).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        },
      }),
    ],
    [t]
  )
}
