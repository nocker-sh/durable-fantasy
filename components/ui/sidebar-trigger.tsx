import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"
import { Button } from "#/components/ui/button"
import { PanelLeft } from "lucide-react"
import { useSidebar } from "#/components/ui/use-sidebar"

export function SidebarTrigger(inputProps: React.ComponentProps<typeof Button>) {
  const className = inputProps.className
  const onClick = inputProps.onClick
  const props = withoutKeys(inputProps, ["className", "onClick"])

  const toggleSidebarSource = useSidebar(),
    toggleSidebar = toggleSidebarSource.toggleSidebar

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft strokeWidth={2} />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
