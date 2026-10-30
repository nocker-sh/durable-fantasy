"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"

export function DialogDescription(inputProps: DialogPrimitive.Description.Props) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground", className)}
      {...props}
    />
  )
}
