import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tooltip } from "#/components/ui/tooltip"
import { TooltipContent } from "#/components/ui/tooltip-content"
import { TooltipTrigger } from "#/components/ui/tooltip-trigger"
import { useSidebar } from "#/components/ui/use-sidebar"
import { sidebarMenuButtonVariants } from "#/components/ui/sidebar-data"

export function SidebarMenuButton(
  inputProps: useRender.ComponentProps<"button"> &
    React.ComponentProps<"button"> & {
      isActive?: boolean
      tooltip?: string | React.ComponentProps<typeof TooltipContent>
    } & VariantProps<typeof sidebarMenuButtonVariants>,
) {
  const render = inputProps.render
  const isActiveValue = inputProps.isActive
  const isActive = isActiveValue === undefined ? false : isActiveValue
  const variantValue = inputProps.variant
  const variant = variantValue === undefined ? "default" : variantValue
  const sizeValue = inputProps.size
  const size = sizeValue === undefined ? "default" : sizeValue
  const tooltip = inputProps.tooltip
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["render", "isActive", "variant", "size", "tooltip", "className"])

  const isMobileSource = useSidebar(),
    isMobile = isMobileSource.isMobile,
    state = isMobileSource.state
  const comp = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      },
      props,
    ),
    render: !tooltip ? render : <TooltipTrigger render={render} />,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive,
    },
  })

  if (!tooltip) {
    return comp
  }

  const tooltipProps = typeof tooltip === "string" ? { children: tooltip } : tooltip

  return (
    <Tooltip>
      {comp}
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltipProps} />
    </Tooltip>
  )
}
