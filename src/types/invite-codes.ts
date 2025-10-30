// ============================================
// 邀请码类型定义
// ============================================

/**
 * 邀请码类型枚举
 */
export enum InviteCodeType {
  USER = "user", // 用户邀请码
  SELLER = "seller", // 卖家邀请码
  BUYER = "buyer", // 买手邀请码
}

/**
 * 邀请人类型枚举
 */
export enum InviterType {
  USER = "user",
  SELLER = "seller",
  CUSTOMER = "customer",
}

/**
 * 邀请关系状态枚举
 */
export enum InviteRelationStatus {
  ACTIVE = "active", // 活跃
  COMPLETED = "completed", // 已完成
  CANCELLED = "cancelled", // 已取消
}

/**
 * 被邀请人类型枚举
 */
export enum InvitedType {
  BUYER = "buyer", // 买手
  SELLER = "seller", // 卖家
}

// ============================================
// Seller 信息类型
// ============================================

export interface VendorSeller {
  id: string
  name?: string
  email?: string
  handle?: string
}

// ============================================
// Customer 信息类型
// ============================================

export interface VendorCustomer {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  has_account?: boolean
}

// ============================================
// 邀请码 DTO
// ============================================

export interface VendorInviteCodeDTO {
  id: string
  code: string // 邀请码
  inviter_id: string // 邀请人 ID
  inviter_type: InviterType // 邀请人类型
  type: InviteCodeType | null // 邀请码类型（null 表示通用）
  is_active: boolean // 是否启用
  expires_at: string | null // 过期时间
  max_uses: number | null // 最大使用次数
  usage_count: number // 已使用次数
  metadata: Record<string, unknown> | null
  deleted_at: string | null
  created_at: string
  updated_at: string

  // 关联数据（通过 link 查询）
  seller?: VendorSeller // 邀请人 seller 信息
}

// ============================================
// 邀请关系 DTO
// ============================================

export interface VendorInviteRelationDTO {
  id: string
  invite_code_id: string // 邀请码 ID
  invited_id: string // 被邀请人 ID
  invited_type: InvitedType // 被邀请人类型
  status: InviteRelationStatus // 状态
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string

  // 关联数据（通过 link 查询）
  seller?: VendorSeller // 被邀请的 seller 信息
  customer?: VendorCustomer // 被邀请的 customer 信息
}

// ============================================
// API 请求参数类型
// ============================================

/**
 * 获取邀请码请求参数（无需参数）
 */
export interface VendorGetInviteCodeParams {
  // 无需参数，自动返回当前 seller 的邀请码
}

/**
 * 获取邀请关系列表请求参数
 */
export interface VendorGetInviteRelationsParams {
  // 分页参数
  offset?: number // 偏移量，默认 0
  limit?: number // 每页数量，默认 20

  // 排序参数
  order?: string // 排序字段，例如 'created_at' 或 '-created_at'（降序）

  // 搜索参数
  q?: string // 搜索查询字符串

  // 筛选参数
  status?: InviteRelationStatus // 筛选状态
  invited_type?: InvitedType // 筛选被邀请人类型

  // 字段选择
  fields?: string // 逗号分隔的字段列表
}

// ============================================
// API 响应类型
// ============================================

/**
 * 获取邀请码响应
 */
export interface VendorGetInviteCodeResponse {
  invite_code: VendorInviteCodeDTO
}

/**
 * 获取邀请关系列表响应
 */
export interface VendorGetInviteRelationsResponse {
  relations: VendorInviteRelationDTO[]
  count: number // 总数
  offset: number // 当前偏移量
  limit: number // 当前每页数量
}

// ============================================
// 二维码相关类型定义
// ============================================

/**
 * 二维码格式枚举
 */
export enum QRCodeFormat {
  PNG = "png",
  SVG = "svg",
  DATA_URL = "data-url",
}

/**
 * 二维码纠错级别枚举
 */
export enum QRCodeErrorCorrection {
  L = "L", // 7%
  M = "M", // 15%
  Q = "Q", // 25%
  H = "H", // 30%
}

/**
 * 获取二维码请求参数
 */
export interface VendorGetInviteQRCodeParams {
  invite_code_id?: string // 指定邀请码ID（不指定则自动查找或创建默认邀请码）
  format?: QRCodeFormat // 二维码格式，默认 png
  size?: number // 二维码尺寸（像素），范围 100-1000，默认 300
  margin?: number // 二维码边距（模块），范围 0-10，默认 4
  color_dark?: string // 前景色（十六进制颜色），默认 #000000
  color_light?: string // 背景色（十六进制颜色），默认 #ffffff
  error_correction?: QRCodeErrorCorrection // 纠错级别，默认 M
  no_cache?: boolean // 是否跳过缓存，默认 false
}

/**
 * Data URL 格式的二维码响应
 */
export interface VendorInviteQRCodeDataUrlResponse {
  data_url: string // base64 编码的 data URL
  code: string // 邀请码
  url: string // 邀请链接
}
