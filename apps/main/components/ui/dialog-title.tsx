"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"

export function DialogTitle(inputProps: DialogPrimitive.Title.Props) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("font-heading text-base leading-none font-medium", className)} {...props} />
}
