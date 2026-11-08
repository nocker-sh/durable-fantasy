"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"

export function DialogOverlay(inputProps: DialogPrimitive.Backdrop.Props) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/80 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  )
}
