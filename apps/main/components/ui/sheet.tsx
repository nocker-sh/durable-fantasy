import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

export function Sheet(inputProps: SheetPrimitive.Root.Props) {
  const props = { ...inputProps }

  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}
