import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function TableRow(inputProps: React.ComponentProps<"tr">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <tr data-slot="table-row" className={cn("border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />
}
