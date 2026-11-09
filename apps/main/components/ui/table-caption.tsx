import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function TableCaption(inputProps: React.ComponentProps<"caption">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
}
