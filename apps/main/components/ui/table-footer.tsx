import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function TableFooter(inputProps: React.ComponentProps<"tfoot">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <tfoot data-slot="table-footer" className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
}
