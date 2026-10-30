import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"
import { DropdownMenuContent } from "#/components/ui/dropdown-menu-content"

export function DropdownMenuSubContent(inputProps: React.ComponentProps<typeof DropdownMenuContent>) {
  const alignValue = inputProps.align
  const align = alignValue === undefined ? "start" : alignValue
  const alignOffsetValue = inputProps.alignOffset
  const alignOffset = alignOffsetValue === undefined ? -3 : alignOffsetValue
  const sideValue = inputProps.side
  const side = sideValue === undefined ? "right" : sideValue
  const sideOffsetValue = inputProps.sideOffset
  const sideOffset = sideOffsetValue === undefined ? 0 : sideOffsetValue
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["align", "alignOffset", "side", "sideOffset", "className"])

  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "w-auto min-w-36 rounded-2xl bg-popover p-1 text-popover-foreground shadow-2xl ring-1 ring-foreground/5 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}
