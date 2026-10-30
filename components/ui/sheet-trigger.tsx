import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

export function SheetTrigger(inputProps: SheetPrimitive.Trigger.Props) {
  const props = { ...inputProps }

  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}
