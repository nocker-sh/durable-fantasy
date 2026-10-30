import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"
import { useIsMobile } from "#/hooks/use-mobile"
import { SIDEBAR_COOKIE_NAME, SIDEBAR_COOKIE_MAX_AGE, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, SIDEBAR_KEYBOARD_SHORTCUT, SidebarContext } from "#/components/ui/sidebar-data"
import type { SidebarContextProps } from "#/components/ui/sidebar-data"

export function SidebarProvider(
  inputProps: React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  },
) {
  const defaultOpenValue = inputProps.defaultOpen
  const defaultOpen = defaultOpenValue === undefined ? true : defaultOpenValue
  const openProp = inputProps.open
  const setOpenProp = inputProps.onOpenChange
  const className = inputProps.className
  const style = inputProps.style
  const children = inputProps.children
  const props = withoutKeys(inputProps, ["defaultOpen", "open", "onOpenChange", "className", "style", "children"])

  const isMobile = useIsMobile()
  const openMobileState = React.useState(false),
    openMobile = openMobileState[0],
    setOpenMobile = openMobileState[1]

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const _openState = React.useState(defaultOpen),
    _open = _openState[0],
    _setOpen = _openState[1]
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  )

  const wrapperStyle: React.CSSProperties & { "--sidebar-width": string; "--sidebar-width-icon": string } = {
    "--sidebar-width": SIDEBAR_WIDTH,
    "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
    ...style,
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <div data-slot="sidebar-wrapper" style={wrapperStyle} className={cn("group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}
