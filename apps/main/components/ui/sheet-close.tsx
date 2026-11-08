import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

export function SheetClose(inputProps: SheetPrimitive.Close.Props) {
  const props = { ...inputProps }

  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}
