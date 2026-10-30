import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

export function Collapsible(inputProps: CollapsiblePrimitive.Root.Props) {
  const props = { ...inputProps }

  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}
