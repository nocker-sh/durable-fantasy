import { withoutKeys } from "#/lib/engine/without-keys"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"
import { Button } from "#/components/ui/button"
import { X } from "lucide-react"
import { SheetPortal } from "#/components/ui/sheet-portal"
import { SheetOverlay } from "#/components/ui/sheet-overlay"

export function SheetContent(
  inputProps: SheetPrimitive.Popup.Props & {
    side?: "top" | "right" | "bottom" | "left"
    showCloseButton?: boolean
  },
) {
  const className = inputProps.className
  const children = inputProps.children
  const sideValue = inputProps.side
  const side = sideValue === undefined ? "right" : sideValue
  const showCloseButtonValue = inputProps.showCloseButton
  const showCloseButton = showCloseButtonValue === undefined ? true : showCloseButtonValue
  const props = withoutKeys(inputProps, ["className", "children", "side", "showCloseButton"])

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" render={<Button variant="ghost" className="absolute top-4 right-4" size="icon-sm" />}>
            <X strokeWidth={2} />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}
