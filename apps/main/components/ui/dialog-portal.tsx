"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

export function DialogPortal(inputProps: DialogPrimitive.Portal.Props) {
  const props = { ...inputProps }

  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}
