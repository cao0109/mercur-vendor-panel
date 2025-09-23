import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Form } from "../../../../../components/common/form"
import { Heading, Input } from "@medusajs/ui"
import { CountrySelect } from "../../../../../components/inputs/country-select"
import { ProductCreateSchemaType } from "../../types"

type ProductCreateAttributesFormProps = {
  form: UseFormReturn<ProductCreateSchemaType>
}

export const ProductCreateAttributesForm: React.FC<
  ProductCreateAttributesFormProps
> = ({ form }) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center p-16">
      <div className="flex w-full max-w-[720px] flex-col gap-y-8">
        <div className="flex flex-col gap-y-8">
          <Heading>{t("products.attributes")}</Heading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Field
              control={form.control}
              name="width"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("fields.width")}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />

            <Form.Field
              control={form.control}
              name="height"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("fields.height")}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Field
              control={form.control}
              name="length"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("fields.length")}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />

            <Form.Field
              control={form.control}
              name="weight"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("fields.weight")}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
          </div>

          <Form.Field
            control={form.control}
            name="mid_code"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label tooltip={t("fields.midCodeTooltip")} optional>
                    {t("fields.midCode")}
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )
            }}
          />

          <Form.Field
            control={form.control}
            name="hs_code"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label tooltip={t("fields.hsCodeTooltip")} optional>
                    {t("fields.hsCode")}
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )
            }}
          />

          <Form.Field
            control={form.control}
            name="origin_country"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>{t("fields.countryOfOrigin")}</Form.Label>
                  <Form.Control>
                    <CountrySelect {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )
            }}
          />
        </div>
      </div>
    </div>
  )
}
