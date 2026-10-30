"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"
import { Button } from "#/components/ui/button"

export function DialogFooter(
  inputProps: React.ComponentProps<"div"> & {
    showCloseButton?: boolean
  },
) {
  const className = inputProps.className
  const showCloseButtonValue = inputProps.showCloseButton
  const showCloseButton = showCloseButtonValue === undefined ? false : showCloseButtonValue
  const children = inputProps.children
  const props = withoutKeys(inputProps, ["className", "showCloseButton", "children"])

  return (
    <div data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props}>
      {children}
      {showCloseButton && <DialogPrimitive.Close render={<Button variant="outline" />}>Close</DialogPrimitive.Close>}
    </div>
  )
}
