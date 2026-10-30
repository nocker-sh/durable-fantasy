import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"
import { Separator } from "#/components/ui/separator"

export function SidebarSeparator(inputProps: React.ComponentProps<typeof Separator>) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <Separator data-slot="sidebar-separator" data-sidebar="separator" className={cn("mx-2 w-auto bg-sidebar-border", className)} {...props} />
}
