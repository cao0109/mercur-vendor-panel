import { Input } from "@medusajs/ui"
import { AttributeSelect } from "./AttributeSelect"

export const Components = ({
  attribute,
  field,
}: {
  attribute: any
  field: any
}) => {
  const { ui_component, possible_values } = attribute

  if (ui_component === "select")
    return <AttributeSelect values={possible_values} field={field} />

  return <Input placeholder="Enter value" {...field} />
}
