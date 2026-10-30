import { withoutKeys } from "#/lib/engine/without-keys"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"

export function SheetDescription(inputProps: SheetPrimitive.Description.Props) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}
