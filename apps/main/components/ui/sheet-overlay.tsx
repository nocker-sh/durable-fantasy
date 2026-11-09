import { withoutKeys } from "#/lib/engine/without-keys"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"

export function SheetOverlay(inputProps: SheetPrimitive.Backdrop.Props) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn("fixed inset-0 z-50 bg-black/80 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs", className)}
      {...props}
    />
  )
}
