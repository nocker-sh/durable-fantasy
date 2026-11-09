import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

export function CollapsibleTrigger(inputProps: CollapsiblePrimitive.Trigger.Props) {
  const props = { ...inputProps }

  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}
