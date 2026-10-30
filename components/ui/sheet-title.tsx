import { withoutKeys } from "#/lib/engine/without-keys"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"

export function SheetTitle(inputProps: SheetPrimitive.Title.Props) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("font-heading text-base font-medium text-foreground", className)} {...props} />
}
