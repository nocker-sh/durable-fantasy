import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function CardDescription(inputProps: React.ComponentProps<"div">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}
