import { useQueryParams } from "../../use-query-params"
import type { VendorGetInviteRelationsParams } from "../../../types/invite-codes"
import { InviteRelationStatus, InvitedType } from "../../../types/invite-codes"

type UseInviteRelationsTableQueryProps = {
  prefix?: string
  pageSize?: number
}

export const useInviteRelationsTableQuery = ({
  prefix,
  pageSize = 20,
}: UseInviteRelationsTableQueryProps) => {
  const queryObject = useQueryParams(
    ["offset", "q", "status", "invited_type", "order"],
    prefix
  )

  const { offset, q, status, invited_type, order } = queryObject

  const searchParams: VendorGetInviteRelationsParams = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    q,
    status: status as InviteRelationStatus | undefined,
    invited_type: invited_type as InvitedType | undefined,
    order: order || "-created_at",
  }

  return {
    searchParams,
    raw: queryObject,
  }
}
