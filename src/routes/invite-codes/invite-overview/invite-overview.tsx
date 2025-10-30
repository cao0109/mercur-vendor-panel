import { ArrowDownTray, Share } from "@medusajs/icons"
import {
  Button,
  Container,
  Copy,
  Drawer,
  Heading,
  Text,
  toast,
} from "@medusajs/ui"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { VendorInviteRelationsList } from "../../../components/invite-codes/invite-relations-list"
import {
  getInviteQRCodeDownloadUrl,
  useVendorInviteCode,
  useVendorInviteQRCode,
} from "../../../hooks/api"
import { QRCodeFormat } from "../../../types/invite-codes"

export const InviteOverview = () => {
  const { t } = useTranslation()
  
  // 获取邀请码
  const { data: inviteCodeData } = useVendorInviteCode()
  const inviteCode = inviteCodeData?.code

  // 获取二维码
  const { data: qrcodeData, isLoading: qrcodeLoading } = useVendorInviteQRCode({
    size: 300,
  })

  // 二维码弹窗状态
  const [qrCodeOpen, setQrCodeOpen] = useState(false)

  // 格式化邀请码显示（添加空格）
  const formattedInviteCode = inviteCode
    ? inviteCode.split("").join(" ")
    : t("inviteCodes.loading")

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="overflow-hidden p-0">
        <div className="px-6 py-4">
          {/* 页面标题和邀请码信息 */}
          <div className="flex items-center justify-between">
            <div>
              <Heading className="mb-1">{t("inviteCodes.pageTitle")}</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                {t("inviteCodes.pageDescription")}
              </Text>
            </div>

            <div className="flex items-center gap-3">
              {/* 邀请码显示 */}
              <div className="flex items-center gap-2">
                <Text size="small" className="text-ui-fg-subtle">
                  {t("inviteCodes.inviteCodeLabel")}
                </Text>
                <code className="text-xl font-mono font-bold tracking-wider text-ui-fg-interactive">
                  {formattedInviteCode}
                </code>
              </div>

              {/* 操作按钮 */}
              {inviteCode && (
                <>
                  <Copy
                    content={inviteCode}
                    className="text-ui-fg-muted hover:text-ui-fg-interactive transition-colors"
                  />

                  <Button
                    size="small"
                    variant="primary"
                    onClick={() => setQrCodeOpen(true)}
                  >
                    <Share />
                    {t("inviteCodes.qrCode")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* 邀请记录表格 */}
      <VendorInviteRelationsList />

      {/* 二维码弹窗 */}
      <Drawer open={qrCodeOpen} onOpenChange={setQrCodeOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{t("inviteCodes.qrCodeTitle")}</Drawer.Title>
            <Drawer.Description>
              {t("inviteCodes.qrCodeDescription")}
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col items-center gap-4 py-8">
            {/* 二维码显示 */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-ui-border-base">
              {qrcodeLoading ? (
                <div
                  className="flex items-center justify-center bg-ui-bg-subtle animate-pulse"
                  style={{ width: 300, height: 300 }}
                >
                  <Text size="small" className="text-ui-fg-subtle">
                    {t("inviteCodes.loading")}
                  </Text>
                </div>
              ) : qrcodeData?.data_url ? (
                <img
                  src={qrcodeData.data_url}
                  alt={t("inviteCodes.qrCodeAlt")}
                  style={{ width: 300, height: 300 }}
                />
              ) : null}
            </div>

            {/* 邀请链接 */}
            {qrcodeData?.url && (
              <div className="w-full max-w-md">
                <Text size="small" className="text-ui-fg-subtle mb-2">
                  {t("inviteCodes.inviteLink")}
                </Text>
                <div className="flex items-center gap-2 rounded-lg border border-ui-border-base bg-ui-bg-base px-3 py-2">
                  <Text
                    size="small"
                    className="flex-1 text-ui-fg-muted break-all font-mono"
                  >
                    {qrcodeData.url}
                  </Text>
                  <Copy
                    content={qrcodeData.url}
                    className="text-ui-fg-muted hover:text-ui-fg-interactive transition-colors flex-shrink-0"
                  />
                </div>
              </div>
            )}

            {/* 下载按钮 */}
            <div className="flex gap-3 w-full max-w-md">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  const url = getInviteQRCodeDownloadUrl({
                    format: QRCodeFormat.PNG,
                    size: 800,
                  })
                  const link = document.createElement("a")
                  link.href = url
                  link.download = `invite-${inviteCode}.png`
                  link.click()

                  toast.success(t("inviteCodes.downloadSuccess"), {
                    description: t("inviteCodes.downloadPngDescription"),
                  })
                }}
              >
                <ArrowDownTray className="mr-2" />
                {t("inviteCodes.downloadPng")}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  const url = getInviteQRCodeDownloadUrl({
                    format: QRCodeFormat.SVG,
                    size: 800,
                  })
                  const link = document.createElement("a")
                  link.href = url
                  link.download = `invite-${inviteCode}.svg`
                  link.click()

                  toast.success(t("inviteCodes.downloadSuccess"), {
                    description: t("inviteCodes.downloadSvgDescription"),
                  })
                }}
              >
                <ArrowDownTray className="mr-2" />
                {t("inviteCodes.downloadSvg")}
              </Button>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={() => setQrCodeOpen(false)}>
              {t("inviteCodes.close")}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

export const Component = InviteOverview
