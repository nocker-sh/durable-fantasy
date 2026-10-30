import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function TableHeader(inputProps: React.ComponentProps<"thead">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
}
