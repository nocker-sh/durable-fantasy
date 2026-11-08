import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function TableHead(inputProps: React.ComponentProps<"th">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <th data-slot="table-head" className={cn("h-12 px-3 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0", className)} {...props} />
}
