"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

export function DialogClose(inputProps: DialogPrimitive.Close.Props) {
  const props = { ...inputProps }

  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}
