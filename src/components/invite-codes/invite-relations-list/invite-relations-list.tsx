import {
  Badge,
  Container,
  createDataTableColumnHelper,
  createDataTableFilterHelper,
  DataTable,
  DataTableFilteringState,
  DataTablePaginationState,
  DataTableSortingState,
  DropdownMenu,
  Heading,
  Text,
  useDataTable,
  Button,
} from "@medusajs/ui"
import { Adjustments, XCircle } from "@medusajs/icons"
import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useVendorInviteRelations,
} from "../../../hooks/api"
import type {
  InviteRelationStatus,
  VendorInviteRelationDTO,
} from "../../../types/invite-codes"

const PAGE_SIZE = 20

export function VendorInviteRelationsList() {
  const { t } = useTranslation()

  // 状态管理
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGE_SIZE,
    pageIndex: 0,
  })
  const [search, setSearch] = useState<string>("")
  const [filtering, setFiltering] = useState<DataTableFilteringState>({})
  const [sorting, setSorting] = useState<DataTableSortingState | null>({
    id: "created_at",
    desc: true,
  })

  // 使用 useCallback 稳定回调函数
  const handlePaginationChange = useCallback((updater: any) => {
    setPagination(updater)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const handleFilteringChange = useCallback((updater: any) => {
    if (typeof updater === "function") {
      setFiltering(updater)
    } else {
      setFiltering(updater)
    }
  }, [])

  const handleSortingChange = useCallback((updater: any) => {
    setSorting(updater)
  }, [])

  // 使用 useMemo 优化列定义
  const columns = useMemo(() => {
    const columnHelper = createDataTableColumnHelper<VendorInviteRelationDTO>()
    
    return [
      columnHelper.display({
        id: "invited_user",
        header: t("inviteCodes.relations.columns.invitedUser"),
        cell: ({ row }) => {
          const relation = row.original
          const userName = relation.customer
            ? `${relation.customer.first_name || ""} ${relation.customer.last_name || ""}`.trim()
            : relation.seller?.name
          const userEmail = relation.customer?.email || relation.seller?.email

          return (
            <div className="flex flex-col gap-0.5">
              <Text size="small" weight="plus" className="text-ui-fg-base">
                {userName || "-"}
              </Text>
              {userEmail && (
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {userEmail}
                </Text>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor("invited_type", {
        header: t("inviteCodes.relations.columns.type"),
        enableSorting: true,
        cell: ({ getValue }) => (
          <Badge size="small" color={getValue() === "buyer" ? "green" : "purple"}>
            {getValue() === "buyer" ? t("inviteCodes.relations.types.buyer") : t("inviteCodes.relations.types.seller")}
          </Badge>
        ),
      }),
      columnHelper.accessor("status", {
        header: t("inviteCodes.relations.columns.status"),
        enableSorting: true,
        cell: ({ getValue }) => {
          const statusConfig: Record<InviteRelationStatus, { color: "green" | "blue" | "grey" }> = {
            active: { color: "green" },
            completed: { color: "blue" },
            cancelled: { color: "grey" },
          }
          const config = statusConfig[getValue()] || statusConfig.active
          return (
            <Badge size="small" color={config.color}>
              {t(`inviteCodes.relations.status.${getValue()}`)}
            </Badge>
          )
        },
      }),
      columnHelper.accessor("created_at", {
        header: t("inviteCodes.relations.columns.inviteTime"),
        enableSorting: true,
        cell: ({ getValue }) => (
          <Text size="small">
            {new Date(getValue()).toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        ),
      }),
    ]
  }, [t])

  // 使用 useMemo 优化过滤器定义
  const filters = useMemo(() => {
    const filterHelper = createDataTableFilterHelper<VendorInviteRelationDTO>()
    
    return [
      filterHelper.accessor("status", {
        type: "select",
        label: t("inviteCodes.relations.columns.status"),
        options: [
          { label: t("inviteCodes.relations.status.active"), value: "active" },
          { label: t("inviteCodes.relations.status.completed"), value: "completed" },
          { label: t("inviteCodes.relations.status.cancelled"), value: "cancelled" },
        ],
      }),
      filterHelper.accessor("invited_type", {
        type: "select",
        label: t("inviteCodes.relations.columns.type"),
        options: [
          { label: t("inviteCodes.relations.types.buyer"), value: "buyer" },
          { label: t("inviteCodes.relations.types.seller"), value: "seller" },
        ],
      }),
    ]
  }, [t])

  // 计算查询参数
  const queryParams = useMemo(() => {
    const offset = pagination.pageIndex * PAGE_SIZE
    const statusFilter = Array.isArray(filtering?.status) && filtering.status.length > 0
      ? filtering.status[0]
      : undefined
    const typeFilter = Array.isArray(filtering?.invited_type) && filtering.invited_type.length > 0
      ? filtering.invited_type[0]
      : undefined
    
    return {
      fields: "*customer,*seller",
      limit: PAGE_SIZE,
      offset,
      q: search || undefined,
      status: statusFilter as any,
      invited_type: typeFilter as any,
      order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : "-created_at",
    }
  }, [pagination, search, filtering, sorting])

  // 获取数据
  const { data, isLoading, isError, error } = useVendorInviteRelations(queryParams)

  const relations = data?.relations || []
  const count = data?.count || 0

  // 创建表实例
  const table = useDataTable({
    columns,
    data: relations,
    getRowId: (row) => row.id,
    rowCount: count,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: handlePaginationChange,
    },
    search: {
      state: search,
      onSearchChange: handleSearchChange,
    },
    filtering: {
      state: filtering,
      onFilteringChange: handleFilteringChange,
    },
    filters,
    sorting: {
      state: sorting,
      onSortingChange: handleSortingChange,
    },
  })

  if (isError) {
    throw error
  }

  return (
    <Container className="overflow-hidden p-0">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 px-6 py-4 md:flex-row md:items-center">
            <div>
              <Heading level="h2">{t("inviteCodes.relations.title")}</Heading>
              <Text className="text-ui-fg-subtle" size="small">
                {t("inviteCodes.relations.description")}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <DataTable.Search placeholder={t("inviteCodes.relations.searchPlaceholder")} />
              
              {/* 自定义筛选下拉菜单 */}
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button size="small" variant="secondary" className="relative">
                    <Adjustments className="mr-1.5" />
                    {t("inviteCodes.relations.filter")}
                    {Object.keys(filtering).length > 0 && (
                      <Badge 
                        size="2xsmall" 
                        className="ml-1.5 bg-blue-500 text-white"
                      >
                        {Object.keys(filtering).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end" className="w-64 p-2">
                  {/* 状态筛选区域 */}
                  <div className="mb-1">
                    <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-ui-fg-subtle">
                      {t("inviteCodes.relations.filterByStatus")}
                    </DropdownMenu.Label>
                    <div className="space-y-0.5">
                      <DropdownMenu.Item
                        onClick={() => {
                          setFiltering((prev) => ({ ...prev, status: undefined }))
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-2 ${
                          !filtering.status ? "bg-ui-bg-subtle" : ""
                        }`}
                      >
                        <span className={!filtering.status ? "font-medium" : ""}>{t("inviteCodes.relations.allStatus")}</span>
                        {!filtering.status && (
                          <span className="text-blue-500">✓</span>
                        )}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => {
                          setFiltering((prev) => ({ ...prev, status: ["active"] }))
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-2 ${
                          Array.isArray(filtering.status) && filtering.status[0] === "active" ? "bg-ui-bg-subtle" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge size="small" color="green">{t("inviteCodes.relations.status.active")}</Badge>
                        </div>
                        {Array.isArray(filtering.status) && filtering.status[0] === "active" && (
                          <span className="text-green-500 font-semibold">✓</span>
                        )}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => {
                          setFiltering((prev) => ({ ...prev, status: ["completed"] }))
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-2 ${
                          Array.isArray(filtering.status) && filtering.status[0] === "completed" ? "bg-ui-bg-subtle" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge size="small" color="blue">{t("inviteCodes.relations.status.completed")}</Badge>
                        </div>
                        {Array.isArray(filtering.status) && filtering.status[0] === "completed" && (
                          <span className="text-blue-500 font-semibold">✓</span>
                        )}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => {
                          setFiltering((prev) => ({ ...prev, status: ["cancelled"] }))
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-2 ${
                          Array.isArray(filtering.status) && filtering.status[0] === "cancelled" ? "bg-ui-bg-subtle" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge size="small" color="grey">{t("inviteCodes.relations.status.cancelled")}</Badge>
                        </div>
                        {Array.isArray(filtering.status) && filtering.status[0] === "cancelled" && (
                          <span className="text-grey-500 font-semibold">✓</span>
                        )}
                      </DropdownMenu.Item>
                    </div>
                  </div>

                  <DropdownMenu.Separator className="my-2" />

                  {/* 类型筛选区域 */}
                  <div className="mb-1">
                    <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-ui-fg-subtle">
                      {t("inviteCodes.relations.filterByType")}
                    </DropdownMenu.Label>
                    <div className="space-y-0.5">
                      <DropdownMenu.Item
                        onClick={() => {
                          setFiltering((prev) => ({ ...prev, invited_type: undefined }))
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-2 ${
                          !filtering.invited_type ? "bg-ui-bg-subtle" : ""
                        }`}
                      >
                        <span className={!filtering.invited_type ? "font-medium" : ""}>{t("inviteCodes.relations.allTypes")}</span>
                        {!filtering.invited_type && (
                          <span className="text-blue-500">✓</span>
                        )}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => {
                          setFiltering((prev) => ({ ...prev, invited_type: ["buyer"] }))
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-2 ${
                          Array.isArray(filtering.invited_type) && filtering.invited_type[0] === "buyer" ? "bg-ui-bg-subtle" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge size="small" color="green">{t("inviteCodes.relations.types.buyer")}</Badge>
                        </div>
                        {Array.isArray(filtering.invited_type) && filtering.invited_type[0] === "buyer" && (
                          <span className="text-green-500 font-semibold">✓</span>
                        )}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => {
                          setFiltering((prev) => ({ ...prev, invited_type: ["seller"] }))
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-2 ${
                          Array.isArray(filtering.invited_type) && filtering.invited_type[0] === "seller" ? "bg-ui-bg-subtle" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge size="small" color="purple">{t("inviteCodes.relations.types.seller")}</Badge>
                        </div>
                        {Array.isArray(filtering.invited_type) && filtering.invited_type[0] === "seller" && (
                          <span className="text-purple-500 font-semibold">✓</span>
                        )}
                      </DropdownMenu.Item>
                    </div>
                  </div>

                  {/* 清除所有筛选 */}
                  {Object.keys(filtering).length > 0 && (
                    <>
                      <DropdownMenu.Separator className="my-2" />
                      <DropdownMenu.Item
                        onClick={() => setFiltering({})}
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                      >
                        <XCircle className="h-4 w-4" />
                        {t("inviteCodes.relations.clearAllFilters")}
                      </DropdownMenu.Item>
                    </>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu>

              <DataTable.SortingMenu tooltip="排序" />
            </div>
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </Container>
  )
}
