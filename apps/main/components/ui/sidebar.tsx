import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"

import { cn } from "cn"

import { Sheet } from "#/components/ui/sheet"

import { SheetContent } from "#/components/ui/sheet-content"

import { SheetDescription } from "#/components/ui/sheet-description"

import { SheetHeader } from "#/components/ui/sheet-header"

import { SheetTitle } from "#/components/ui/sheet-title"

import { useSidebar } from "#/components/ui/use-sidebar"

export function Sidebar(
  inputProps: React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  },
) {
  const sideValue = inputProps.side
  const side = sideValue === undefined ? "left" : sideValue
  const variantValue = inputProps.variant
  const variant = variantValue === undefined ? "sidebar" : variantValue
  const collapsibleValue = inputProps.collapsible
  const collapsible = collapsibleValue === undefined ? "offcanvas" : collapsibleValue
  const className = inputProps.className
  const children = inputProps.children
  const dir = inputProps.dir
  const props = withoutKeys(inputProps, ["side", "variant", "collapsible", "className", "children", "dir"])

  const isMobileSource = useSidebar(),
    isMobile = isMobileSource.isMobile,
    state = isMobileSource.state,
    openMobile = isMobileSource.openMobile,
    setOpenMobile = isMobileSource.setOpenMobile

  if (collapsible === "none") {
    return (
      <div data-slot="sidebar" className={cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className)} {...props}>
        {children}
      </div>
    )
  }

  if (isMobile) {
    const mobileStyle: React.CSSProperties & { "--sidebar-width": string } = { "--sidebar-width": SIDEBAR_WIDTH_MOBILE }
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={mobileStyle}
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
import { SIDEBAR_WIDTH_MOBILE } from "#/components/ui/sidebar-data"
