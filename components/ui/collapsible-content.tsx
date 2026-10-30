import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

export function CollapsibleContent(inputProps: CollapsiblePrimitive.Panel.Props) {
  const props = { ...inputProps }

  return <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
}
