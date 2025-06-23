import { Container, Heading } from "@medusajs/ui"

import { HttpTypes } from "@medusajs/types"
import { PencilSquare } from "@medusajs/icons"
import { ActionMenu } from "../../../../../components/common/action-menu"

type ProductAttributeSectionProps = {
  product: HttpTypes.AdminProduct & { attribute_values: any[] }
}

export const ProductAdditionalAttributesSection = ({
  product,
}: ProductAttributeSectionProps) => {
  const { attribute_values } = product

  if (attribute_values.length) return null
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Additional Attributes</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: "Edit",
                  to: "additional-attributes",
                  icon: <PencilSquare />,
                },
              ],
            },
          ]}
        />
      </div>
    </Container>
  )
}
