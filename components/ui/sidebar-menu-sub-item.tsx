import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function SidebarMenuSubItem(inputProps: React.ComponentProps<"li">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <li data-slot="sidebar-menu-sub-item" data-sidebar="menu-sub-item" className={cn("group/menu-sub-item relative", className)} {...props} />
}
