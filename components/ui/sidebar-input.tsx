import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"
import { Input } from "#/components/ui/input"

export function SidebarInput(inputProps: React.ComponentProps<typeof Input>) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <Input data-slot="sidebar-input" data-sidebar="input" className={cn("h-8 w-full bg-background shadow-none", className)} {...props} />
}
