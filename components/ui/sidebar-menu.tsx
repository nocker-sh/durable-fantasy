import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function SidebarMenu(inputProps: React.ComponentProps<"ul">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <ul data-slot="sidebar-menu" data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
}
