import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function SidebarMenuItem(inputProps: React.ComponentProps<"li">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
}
