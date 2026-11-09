import { withoutKeys } from "#/lib/engine/without-keys"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"

export function DropdownMenuContent(inputProps: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  const alignValue = inputProps.align
  const align = alignValue === undefined ? "start" : alignValue
  const alignOffsetValue = inputProps.alignOffset
  const alignOffset = alignOffsetValue === undefined ? 0 : alignOffsetValue
  const sideValue = inputProps.side
  const side = sideValue === undefined ? "bottom" : sideValue
  const sideOffsetValue = inputProps.sideOffset
  const sideOffset = sideOffsetValue === undefined ? 4 : sideOffsetValue
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["align", "alignOffset", "side", "sideOffset", "className"])

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="isolate z-50 outline-none" align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset}>
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-48 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-2xl bg-popover p-1 text-popover-foreground shadow-2xl ring-1 ring-foreground/5 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}
