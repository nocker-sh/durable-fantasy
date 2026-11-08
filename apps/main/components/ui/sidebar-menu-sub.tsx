import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function SidebarMenuSub(inputProps: React.ComponentProps<"ul">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden", className)}
      {...props}
    />
  )
}
