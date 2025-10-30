import { ArrowDownTray, SquareTwoStack, ArrowPath } from "@medusajs/icons"
import { useState } from "react"
import { Button, toast } from "@medusajs/ui"
import { useVendorInviteQRCode, getInviteQRCodeDownloadUrl } from "../../../hooks/api/invite-codes"
import { QRCodeFormat, QRCodeErrorCorrection, VendorGetInviteQRCodeParams } from "../../../types/invite-codes"

interface InviteQRCodeProps {
  /**
   * 邀请码 ID（可选，不指定则使用默认邀请码）
   */
  inviteCodeId?: string
  
  /**
   * 二维码尺寸（像素）
   */
  size?: number
  
  /**
   * 是否显示下载按钮
   */
  showDownload?: boolean
  
  /**
   * 是否显示复制链接按钮
   */
  showCopyLink?: boolean
  
  /**
   * 简洁模式（只显示二维码图片）
   */
  minimal?: boolean
  
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 邀请二维码显示组件
 * 
 * @example
 * ```tsx
 * // 基础用法
 * <InviteQRCode />
 * 
 * // 自定义尺寸
 * <InviteQRCode size={400} />
 * 
 * // 指定邀请码
 * <InviteQRCode inviteCodeId="invite_123" />
 * 
 * // 隐藏操作按钮
 * <InviteQRCode showDownload={false} showCopyLink={false} />
 * ```
 */
export const InviteQRCode = ({
  inviteCodeId,
  size = 300,
  showDownload = true,
  showCopyLink = true,
  minimal = false,
  className = "",
}: InviteQRCodeProps) => {
  const [refreshKey, setRefreshKey] = useState(0)
  
  const params: VendorGetInviteQRCodeParams = {
    invite_code_id: inviteCodeId,
    size,
    error_correction: QRCodeErrorCorrection.M,
  }

  const { data: qrcode, isLoading, isError, error, refetch } = useVendorInviteQRCode(
    { ...params, no_cache: refreshKey > 0 },
    {
      enabled: true,
    }
  )

  const handleDownloadPNG = () => {
    const url = getInviteQRCodeDownloadUrl({
      ...params,
      format: QRCodeFormat.PNG,
    })
    
    const link = document.createElement("a")
    link.href = url
    link.download = `invite-qrcode-${qrcode?.code || "code"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("提示", {
      description: "二维码下载成功",
    })
  }

  const handleDownloadSVG = () => {
    const url = getInviteQRCodeDownloadUrl({
      ...params,
      format: QRCodeFormat.SVG,
    })
    
    const link = document.createElement("a")
    link.href = url
    link.download = `invite-qrcode-${qrcode?.code || "code"}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("提示", {
      description: "二维码下载成功",
    })
  }

  const handleCopyLink = async () => {
    if (!qrcode?.url) return
    
    try {
      await navigator.clipboard.writeText(qrcode.url)
      toast.success("提示", {
        description: "邀请链接已复制到剪贴板",
      })
    } catch (err) {
      toast.error("错误", {
        description: "复制失败，请手动复制",
      })
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    refetch()
    toast.success("提示", {
      description: "二维码已刷新",
    })
  }

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div
          className="flex items-center justify-center bg-gray-100 rounded-lg animate-pulse"
          style={{ width: size, height: size }}
        >
          <span className="text-sm text-gray-400">加载中...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div
          className="flex flex-col items-center justify-center bg-red-50 rounded-lg border border-red-200"
          style={{ width: size, height: size }}
        >
          <span className="text-sm text-red-600 text-center px-4">
            加载失败
            <br />
            {error?.message || "未知错误"}
          </span>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={handleRefresh}
        >
          <ArrowPath />
          重试
        </Button>
      </div>
    )
  }

  if (!qrcode) {
    return null
  }

  // 简洁模式：只显示二维码图片
  if (minimal) {
    return (
      <img
        src={qrcode.data_url}
        alt="邀请二维码"
        className={className}
        style={{ width: size, height: size }}
      />
    )
  }

  // 完整模式
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* 二维码图片 */}
      <div className="relative bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <img
          src={qrcode.data_url}
          alt="邀请二维码"
          className="rounded"
          style={{ width: size, height: size }}
        />
      </div>

      {/* 邀请码信息 */}
      <div className="text-center">
        <p className="text-sm text-gray-500">邀请码</p>
        <p className="text-lg font-semibold text-gray-900">{qrcode.code}</p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 flex-wrap justify-center">
        {showDownload && (
          <>
            <Button
              variant="secondary"
              size="small"
              onClick={handleDownloadPNG}
            >
              <ArrowDownTray />
              下载 PNG
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={handleDownloadSVG}
            >
              <ArrowDownTray />
              下载 SVG
            </Button>
          </>
        )}
        {showCopyLink && (
          <Button
            variant="secondary"
            size="small"
            onClick={handleCopyLink}
          >
            <SquareTwoStack />
            复制链接
          </Button>
        )}
        <Button
          variant="secondary"
          size="small"
          onClick={handleRefresh}
        >
          <ArrowPath />
          刷新
        </Button>
      </div>

      {/* 邀请链接 */}
      <div className="w-full max-w-md">
        <p className="text-xs text-gray-500 mb-1">邀请链接</p>
        <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
          <p className="text-xs text-gray-700 break-all">{qrcode.url}</p>
        </div>
      </div>
    </div>
  )
}
