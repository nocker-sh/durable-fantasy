import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function TableBody(inputProps: React.ComponentProps<"tbody">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}
