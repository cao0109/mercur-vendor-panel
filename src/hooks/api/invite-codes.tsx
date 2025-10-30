import { FetchError } from "@medusajs/js-sdk"
import { QueryKey, UseQueryOptions, useQuery } from "@tanstack/react-query"
import { fetchQuery } from "../../lib/client"
import { queryKeysFactory } from "../../lib/query-key-factory"
import type {
  VendorGetInviteCodeResponse,
  VendorGetInviteRelationsParams,
  VendorGetInviteRelationsResponse,
  VendorInviteCodeDTO,
  VendorGetInviteQRCodeParams,
  VendorInviteQRCodeDataUrlResponse,
} from "../../types/invite-codes"
import { QRCodeFormat } from "../../types/invite-codes"

const VENDOR_INVITE_CODES_QUERY_KEY = "vendor-invite-codes" as const
const vendorInviteCodesQueryKeys = queryKeysFactory(
  VENDOR_INVITE_CODES_QUERY_KEY
)

// ============================================
// Hook: 获取当前 Seller 的邀请码
// ============================================

/**
 * 获取当前登录 Seller 的邀请码
 *
 * @example
 * ```tsx
 * const { data: inviteCode, isLoading, error } = useVendorInviteCode()
 *
 * if (inviteCode) {
 *   console.log('我的邀请码:', inviteCode.code)
 * }
 * ```
 */
export const useVendorInviteCode = (
  options?: Omit<
    UseQueryOptions<
      VendorInviteCodeDTO,
      FetchError,
      VendorInviteCodeDTO,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: vendorInviteCodesQueryKeys.detail("mine"),
    queryFn: async () => {
      const response: VendorGetInviteCodeResponse = await fetchQuery(
        "/vendor/invite-codes",
        {
          method: "GET",
        }
      )
      return response.invite_code
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据视为新鲜
    retry: 2,
    ...options,
  })

  return { data, ...rest }
}

// ============================================
// Hook: 获取邀请关系列表
// ============================================

/**
 * 获取当前 Seller 的邀请关系列表（分页、筛选、排序）
 *
 * @example
 * ```tsx
 * // 获取第一页（默认按创建时间降序）
 * const { data, isLoading } = useVendorInviteRelations({
 *   offset: 0,
 *   limit: 20,
 *   order: '-created_at'
 * })
 *
 * // 筛选活跃的买手邀请
 * const { data } = useVendorInviteRelations({
 *   status: InviteRelationStatus.ACTIVE,
 *   invited_type: InvitedType.BUYER
 * })
 * ```
 */
export const useVendorInviteRelations = (
  params?: VendorGetInviteRelationsParams,
  options?: Omit<
    UseQueryOptions<
      VendorGetInviteRelationsResponse,
      FetchError,
      VendorGetInviteRelationsResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: vendorInviteCodesQueryKeys.list(params),
    queryFn: async () => {
      const queryParams: Record<string, string | number> = {}

      if (params?.offset !== undefined) {
        queryParams.offset = params.offset
      }
      if (params?.limit !== undefined) {
        queryParams.limit = params.limit
      }
      if (params?.order) {
        queryParams.order = params.order
      }
      if (params?.status) {
        queryParams.status = params.status
      }
      if (params?.invited_type) {
        queryParams.invited_type = params.invited_type
      }
      if (params?.fields) {
        queryParams.fields = params.fields
      }

      return await fetchQuery("/vendor/invite-codes/relations", {
        method: "GET",
        query: queryParams,
      })
    },
    staleTime: 30 * 1000, // 30秒内数据视为新鲜
    ...options,
  })

  return { data, ...rest }
}

// ============================================
// Hook: 获取邀请二维码（Data URL 格式）
// ============================================

/**
 * 获取邀请二维码（返回 Data URL，适合在前端直接显示）
 *
 * @example
 * ```tsx
 * // 使用默认参数获取二维码
 * const { data: qrcode, isLoading } = useVendorInviteQRCode()
 *
 * if (qrcode) {
 *   return <img src={qrcode.data_url} alt="邀请二维码" />
 * }
 *
 * // 自定义样式
 * const { data } = useVendorInviteQRCode({
 *   size: 500,
 *   color_dark: '#FF0000',
 *   error_correction: QRCodeErrorCorrection.H
 * })
 * ```
 */
export const useVendorInviteQRCode = (
  params?: VendorGetInviteQRCodeParams,
  options?: Omit<
    UseQueryOptions<
      VendorInviteQRCodeDataUrlResponse,
      FetchError,
      VendorInviteQRCodeDataUrlResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: vendorInviteCodesQueryKeys.detail("qrcode", params),
    queryFn: async () => {
      const queryParams: Record<string, string | number> = {
        format: QRCodeFormat.DATA_URL, // 强制使用 data-url 格式
      }

      // 添加可选参数
      if (params?.invite_code_id) {
        queryParams.invite_code_id = params.invite_code_id
      }
      if (params?.size !== undefined) {
        queryParams.size = params.size
      }
      if (params?.margin !== undefined) {
        queryParams.margin = params.margin
      }
      if (params?.color_dark) {
        queryParams.color_dark = params.color_dark
      }
      if (params?.color_light) {
        queryParams.color_light = params.color_light
      }
      if (params?.error_correction) {
        queryParams.error_correction = params.error_correction
      }
      if (params?.no_cache) {
        queryParams.no_cache = "true"
      }

      return await fetchQuery("/vendor/invite-codes/qrcode", {
        method: "GET",
        query: queryParams,
      })
    },
    staleTime: 24 * 60 * 60 * 1000, // 24小时缓存（二维码内容不会频繁变化）
    retry: 2,
    ...options,
  })

  return { data, ...rest }
}

// ============================================
// 工具函数：生成二维码下载 URL
// ============================================

/**
 * 生成二维码图片的下载 URL
 *
 * @example
 * ```tsx
 * // 生成 PNG 格式的下载链接
 * const pngUrl = getInviteQRCodeDownloadUrl({ format: QRCodeFormat.PNG })
 *
 * // 生成自定义样式的 SVG 链接
 * const svgUrl = getInviteQRCodeDownloadUrl({
 *   format: QRCodeFormat.SVG,
 *   size: 800,
 *   color_dark: '#1a56db'
 * })
 *
 * // 在按钮中使用
 * <a href={pngUrl} download="invite-qrcode.png">
 *   下载二维码
 * </a>
 * ```
 */
export const getInviteQRCodeDownloadUrl = (
  params?: VendorGetInviteQRCodeParams
): string => {
  const baseUrl = import.meta.env.VITE_MEDUSA_ADMIN_BACKEND_URL || ""
  const queryParams = new URLSearchParams()

  // 添加参数
  if (params?.invite_code_id) {
    queryParams.set("invite_code_id", params.invite_code_id)
  }
  if (params?.format) {
    queryParams.set("format", params.format)
  }
  if (params?.size !== undefined) {
    queryParams.set("size", params.size.toString())
  }
  if (params?.margin !== undefined) {
    queryParams.set("margin", params.margin.toString())
  }
  if (params?.color_dark) {
    queryParams.set("color_dark", params.color_dark)
  }
  if (params?.color_light) {
    queryParams.set("color_light", params.color_light)
  }
  if (params?.error_correction) {
    queryParams.set("error_correction", params.error_correction)
  }
  if (params?.no_cache) {
    queryParams.set("no_cache", "true")
  }

  const queryString = queryParams.toString()
  return `${baseUrl}/vendor/invite-codes/qrcode${queryString ? `?${queryString}` : ""}`
}

// ============================================
// 导出 Query Keys（用于手动缓存失效等操作）
// ============================================

export { vendorInviteCodesQueryKeys }
