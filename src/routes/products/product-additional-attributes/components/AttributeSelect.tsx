import { Select } from "@medusajs/ui"

export const AttributeSelect = ({
  values,
  field,
}: {
  values: any[]
  field: any
}) => {
  //   console.log({ values })
  return (
    <Select onValueChange={field.onChange} value={field.value}>
      <Select.Trigger className="bg-ui-bg-base">
        <Select.Value placeholder="Select value" />
      </Select.Trigger>
      <Select.Content>
        {values.map(({ id, attribute_id, value }) => (
          <Select.Item
            key={`select-option-${attribute_id}-${id}`}
            value={attribute_id}
          >
            {value}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  )
}
