import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function SidebarHeader(inputProps: React.ComponentProps<"div">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <div data-slot="sidebar-header" data-sidebar="header" className={cn("flex flex-col gap-2 p-2 [--radius:var(--radius-xl)]", className)} {...props} />
}
