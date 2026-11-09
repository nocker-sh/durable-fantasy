"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"
import { Button } from "#/components/ui/button"
import { X } from "lucide-react"
import { DialogPortal } from "#/components/ui/dialog-portal"
import { DialogOverlay } from "#/components/ui/dialog-overlay"

export function DialogContent(
  inputProps: DialogPrimitive.Popup.Props & {
    showCloseButton?: boolean
  },
) {
  const className = inputProps.className
  const children = inputProps.children
  const showCloseButtonValue = inputProps.showCloseButton
  const showCloseButton = showCloseButtonValue === undefined ? true : showCloseButtonValue
  const props = withoutKeys(inputProps, ["className", "children", "showCloseButton"])

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-4xl bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/5 duration-100 outline-none sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" render={<Button variant="ghost" className="absolute top-4 right-4" size="icon-sm" />}>
            <X strokeWidth={2} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}
