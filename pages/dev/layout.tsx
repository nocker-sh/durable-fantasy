// The one frame of every /dev page: the game's tables on the left, always open and still while the
// page scrolls; the page on the right, which never runs wider than the window.
import "#resources/dev/dev"
import type { ReactNode } from "react"
import { useRouter } from "@void/react"
import { Sidebar } from "#/components/ui/sidebar"
import { SidebarContent } from "#/components/ui/sidebar-content"
import { SidebarGroup } from "#/components/ui/sidebar-group"
import { SidebarGroupContent } from "#/components/ui/sidebar-group-content"
import { SidebarInset } from "#/components/ui/sidebar-inset"
import { SidebarMenu } from "#/components/ui/sidebar-menu"
import { SidebarMenuButton } from "#/components/ui/sidebar-menu-button"
import { SidebarMenuItem } from "#/components/ui/sidebar-menu-item"
import { SidebarProvider } from "#/components/ui/sidebar-provider"
import { SHEETS } from "#/dev/sheets/registry"
import { useNoCanvasMenu } from "#/hooks/use-no-canvas-menu"

const ignore = () => {}

export default function DevLayout(inputProps: { children: ReactNode }) {
  const children = inputProps.children

  useNoCanvasMenu()
  const at = useRouter().path.split("/")[2]
  const sheet = SHEETS.find((s) => s.id === at)
  return (
    <SidebarProvider open onOpenChange={ignore} className="h-svh">
      <Sidebar collapsible="none" className="border-r">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {SHEETS.map((s) => (
                  <SidebarMenuItem key={s.id}>
                    <SidebarMenuButton size="sm" render={<a href={`/dev/${s.id}`} />} isActive={s === sheet}>
                      {s.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-x-hidden overflow-y-auto">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
