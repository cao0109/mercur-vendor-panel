import { zodResolver } from "@hookform/resolvers/zod"
import {
  Alert,
  Button,
  Container,
  Heading,
  Input,
  Text,
  toast,
} from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod"

import { useEffect, useState } from "react"
import { Form } from "../../../components/common/form"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useResetPasswordForEmailPass } from "../../../hooks/api/auth"
import { useUserMe } from "../../../hooks/api/users"

const ResetPasswordInstructionsSchema = z.object({
  email: z.string().email(),
})

const ResetPasswordInstructions = () => {
  const { t } = useTranslation()

  const [showAlert, setShowAlert] = useState(false)

  const { member, isPending: isUserLoading } = useUserMe()

  const form = useForm<z.infer<typeof ResetPasswordInstructionsSchema>>({
    resolver: zodResolver(ResetPasswordInstructionsSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    if (member?.email) {
      form.reset({ email: member.email })
    }
  }, [form, member?.email])

  const { mutateAsync, isPending } = useResetPasswordForEmailPass()

  const handleSubmit = form.handleSubmit(async ({ email }) => {
    await mutateAsync(
      {
        email,
      },
      {
        onSuccess: () => {
          form.reset()
          setShowAlert(true)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  })

  return (
    <Container className="px-6 py-8">
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-1">
          <Heading>{t("resetPassword.resetPassword")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("resetPassword.hint")}
          </Text>
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
            <Form.Field
              control={form.control}
              name="email"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t("fields.email")}</Form.Label>
                  <Form.Control>
                    <Input
                      autoComplete="email"
                      readOnly
                      disabled={!member?.email}
                      {...field}
                    />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            {showAlert && (
              <Alert
                dismissible
                variant="success"
              >
                <div className="flex flex-col">
                  <span className="text-ui-fg-base mb-1">
                    {t("resetPassword.successfulRequestTitle")}
                  </span>
                  <span>{t("resetPassword.successfulRequest")}</span>
                </div>
              </Alert>
            )}
            <Button
              className="w-fit"
              type="submit"
              isLoading={isPending || isUserLoading}
              disabled={!member?.email}
            >
              {t("resetPassword.sendResetInstructions")}
            </Button>
          </form>
        </Form>
      </div>
    </Container>
  )
}

export const SettingsResetPassword = () => {
  return (
    <SingleColumnPage hasOutlet={false} widgets={{ before: [], after: [] }}>
      <ResetPasswordInstructions />
    </SingleColumnPage>
  )
}
