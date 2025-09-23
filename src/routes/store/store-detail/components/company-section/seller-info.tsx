import { Container, Divider, FocusModal, Heading, Text } from "@medusajs/ui"

const companyTypeMap = {
  individual: "个体工商户",
  enterprise: "企业",
  foreign: "外资企业",
}

const exportExperienceMap = {
  none: "无经验",
  "1-3": "1-3年",
  "3-5": "3-5年",
  "5-10": "5-10年",
  "10+": "10年以上",
}
export function SellerInfo({ metadata }: { metadata: any }) {
  return (
    <>
      <div className="flex gap-4">
        <Container className="px-0">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <Heading>公司信息</Heading>
            </div>
          </div>
          <div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                营业执照号
              </Text>
              <Text className="w-1/2">
                {metadata?.basic?.businessLicense || "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                公司类型
              </Text>
              <Text className="w-1/2">
                {companyTypeMap[
                  metadata?.basic?.companyType! as keyof typeof companyTypeMap
                ] || "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                注册资本
              </Text>
              <Text className="w-1/2">
                {metadata?.basic?.registeredCapital
                  ? metadata?.basic?.registeredCapital + "（万元）"
                  : "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                成立日期
              </Text>
              <Text className="w-1/2">
                {metadata?.basic?.establishmentDate || "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                法定代表人
              </Text>
              <Text className="w-1/2">
                {metadata?.basic?.legalRepresentative || "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                法定代表人身份证
              </Text>
              {(!metadata?.legalRepresentativeFiles ||
                metadata?.legalRepresentativeFiles.length === 0) && (
                <Text className="w-1/2">-</Text>
              )}
            </div>
            {metadata?.legalRepresentativeFiles &&
              metadata?.legalRepresentativeFiles.length > 0 &&
              metadata?.legalRepresentativeFiles.map((file: any) => (
                <FocusModal key={file.id}>
                  <FocusModal.Trigger>
                    <img
                      width={200}
                      height={200}
                      src={file?.url}
                      alt="法定代表人身份证"
                    />
                  </FocusModal.Trigger>
                  <FocusModal.Content>
                    <FocusModal.Header>法定代表人身份证</FocusModal.Header>
                    <FocusModal.Body className="flex flex-col items-center py-16">
                      <img src={file?.url} alt="法定代表人身份证" />
                    </FocusModal.Body>
                  </FocusModal.Content>
                </FocusModal>
              ))}
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                联系人姓名
              </Text>
              <Text className="w-1/2">
                {metadata?.basic?.contactPerson || "-"}
              </Text>
            </div>
            <Divider />
            {/* <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                联系电话
              </Text>
              <Text className="w-1/2">
                {metadata?.basic?.contactPhone || '-'}
              </Text>
            </div>
            <Divider /> */}
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">职位</Text>
              <Text className="w-1/2">
                {metadata?.basic?.contactPosition || "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                紧急联系人姓名
              </Text>
              <Text className="w-1/2">
                {metadata?.basic?.emergencyContact?.name || "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                紧急联系人电话
              </Text>
              <Text className="w-1/2">
                {metadata?.basic?.emergencyContact?.phone || "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                与紧急联系人关系
              </Text>
              <Text className="w-1/2">
                {metadata?.basic?.emergencyContact?.relationship || "-"}
              </Text>
            </div>
          </div>
        </Container>
        <Container className="px-0">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <Heading>业务信息</Heading>
            </div>
          </div>
          <div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                出口经验
              </Text>
              <Text className="w-1/2">
                {metadata?.business?.exportExperience
                  ? exportExperienceMap[
                      metadata?.business
                        ?.exportExperience as keyof typeof exportExperienceMap
                    ]
                  : "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                年销售额
              </Text>
              <Text className="w-1/2">
                {metadata?.business?.annualSales
                  ? metadata?.business?.annualSales + "（万元）"
                  : "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                员工规模
              </Text>
              <Text className="w-1/2">
                {metadata?.business?.employeeCount
                  ? metadata?.business?.employeeCount + "（人）"
                  : "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                生产能力
              </Text>
              <Text className="w-1/2">
                {metadata?.business?.productionCapacity
                  ? metadata?.business?.productionCapacity + "（万件）/年"
                  : "-"}
              </Text>
            </div>
            <Divider />
            <div className="px-8 py-4 flex">
              <Text className="font-medium text-ui-fg-subtle w-1/2">
                经营范围及主营产品
              </Text>
              <Text className="w-1/2">
                {metadata?.business?.businessScope || "-"}
              </Text>
            </div>
          </div>
        </Container>
      </div>
      <Container className="px-0">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <Heading>补充信息</Heading>
          </div>
        </div>
        <div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">
              国家/地区
            </Text>
            <Text className="w-1/2">
              {metadata?.additional?.companyAddress.country_code || "-"}
            </Text>
          </div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">省/州</Text>
            <Text className="w-1/2">
              {metadata?.additional?.companyAddress.province || "-"}
            </Text>
          </div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">城市</Text>
            <Text className="w-1/2">
              {metadata?.additional?.companyAddress.city || "-"}
            </Text>
          </div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">区/县</Text>
            <Text className="w-1/2">
              {metadata?.additional?.companyAddress.address_1 || "-"}
            </Text>
          </div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">
              详细地址
            </Text>
            <Text className="w-1/2">
              {metadata?.additional?.companyAddress.address_2 || "-"}
            </Text>
          </div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">
              邮政编码
            </Text>
            <Text className="w-1/2">
              {metadata?.additional?.companyAddress.postal_code || "-"}
            </Text>
          </div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">
              公司网站
            </Text>
            <Text className="w-1/2">
              {metadata?.additional?.website || "-"}
            </Text>
          </div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">
              营业执照
            </Text>
            {metadata?.businessLicenseFile?.url ? (
              <FocusModal>
                <FocusModal.Trigger>
                  <img
                    width={200}
                    height={200}
                    src={metadata?.businessLicenseFile?.url}
                    alt="营业执照"
                  />
                </FocusModal.Trigger>
                <FocusModal.Content>
                  <FocusModal.Header>营业执照</FocusModal.Header>
                  <FocusModal.Body className="flex flex-col items-center py-16">
                    <img
                      src={metadata?.businessLicenseFile?.url}
                      alt="营业执照"
                    />
                  </FocusModal.Body>
                </FocusModal.Content>
              </FocusModal>
            ) : (
              <Text className="w-1/2">-</Text>
            )}
          </div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">协议</Text>
            <Text className="w-1/2">
              {metadata?.agreementFile?.url ? (
                <a className="underline" href={metadata?.agreementFile?.url}>
                  协议文件（点击下载）
                </a>
              ) : (
                "-"
              )}
            </Text>
          </div>
          <Divider />
          <div className="px-8 py-4 flex">
            <Text className="font-medium text-ui-fg-subtle w-1/2">
              其他文件
            </Text>
            {(!metadata?.otherDocuments ||
              metadata?.otherDocuments.length === 0) && (
              <Text className="w-1/2">-</Text>
            )}
          </div>
          {metadata?.otherDocuments &&
            metadata?.otherDocuments.length > 0 &&
            metadata?.otherDocuments.map((file: any) => (
              <FocusModal key={file.id}>
                <FocusModal.Trigger>
                  <img
                    width={200}
                    height={200}
                    src={file?.url}
                    alt="其他文件"
                  />
                </FocusModal.Trigger>
                <FocusModal.Content>
                  <FocusModal.Header>其他文件</FocusModal.Header>
                  <FocusModal.Body className="flex flex-col items-center py-16">
                    <img src={file?.url} alt="其他文件" />
                  </FocusModal.Body>
                </FocusModal.Content>
              </FocusModal>
            ))}
        </div>
      </Container>
    </>
  )
}
