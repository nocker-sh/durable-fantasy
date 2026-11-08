import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function CardAction(inputProps: React.ComponentProps<"div">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />
}
