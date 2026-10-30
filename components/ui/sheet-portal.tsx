import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

export function SheetPortal(inputProps: SheetPrimitive.Portal.Props) {
  const props = { ...inputProps }

  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}
