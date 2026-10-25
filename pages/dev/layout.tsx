// The one frame of every /dev page: the game's tables on the left, always open and still while the
// page scrolls; the page on the right, which never runs wider than the window.
import "#/dev/dev.css"
import type { ReactNode } from "react"
import { useRouter } from "@void/react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "#/components/ui/sidebar.tsx"
import { SHEETS } from "#/dev/db.tsx"
import { useNoCanvasMenu } from "#/hooks/use-no-canvas-menu.ts"

const ignore = () => {}

export default function DevLayout({ children }: { children: ReactNode }) {
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
