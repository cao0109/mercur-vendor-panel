"use client"

import { Button, Heading } from "@medusajs/ui"
import { RouteDrawer } from "../../../components/modals"
import { useProductAttributes } from "../../../hooks/api/products"
import { useParams } from "react-router-dom"
import { Components } from "./components/Components"
import { useForm } from "react-hook-form"
import { Form } from "../../../components/common/form"

export const ProductAdditionalAttributesForm = () => {
  const { id } = useParams()
  const form = useForm()

  const { attributes, isLoading } = useProductAttributes(id!)

  if (isLoading) return <div>Loading...</div>

  const onSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading level="h2">Additional Attributes</Heading>
      </RouteDrawer.Header>
      <RouteDrawer.Body>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {attributes.map((a: any) => (
              <Form.Field
                key={`form-field-${a.handle}-${a.id}`}
                control={form.control}
                name={a.handle}
                render={({ field }) => {
                  return (
                    <Form.Item key={a.name} className="w-full mb-4">
                      <Form.Label className="flex flex-col gap-y-2 w-full">
                        {a.name}
                        <Form.Control>
                          <Components attribute={a} field={field} />
                        </Form.Control>
                      </Form.Label>
                    </Form.Item>
                  )
                }}
              />
            ))}
            <div className="flex justify-end mt-4">
              <Button>Save</Button>
            </div>
          </form>
        </Form>
      </RouteDrawer.Body>
    </RouteDrawer>
  )
}
