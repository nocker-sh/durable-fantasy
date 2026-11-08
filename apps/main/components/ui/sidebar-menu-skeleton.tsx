import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"
import { Skeleton } from "#/components/ui/skeleton"

export function SidebarMenuSkeleton(
  inputProps: React.ComponentProps<"div"> & {
    showIcon?: boolean
  },
) {
  const className = inputProps.className
  const showIconValue = inputProps.showIcon
  const showIcon = showIconValue === undefined ? false : showIconValue
  const props = withoutKeys(inputProps, ["className", "showIcon"])

  // Random width between 50 to 90%.
  const widthState = React.useState(() => {
      return `${Math.floor(Math.random() * 40) + 50}%`
    }),
    width = widthState[0]

  const skeletonStyle: React.CSSProperties & { "--skeleton-width": string } = { "--skeleton-width": width }

  return (
    <div data-slot="sidebar-menu-skeleton" data-sidebar="menu-skeleton" className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)} {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton className="h-4 max-w-(--skeleton-width) flex-1" data-sidebar="menu-skeleton-text" style={skeletonStyle} />
    </div>
  )
}
