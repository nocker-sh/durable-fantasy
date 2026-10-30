"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

export function Dialog(inputProps: DialogPrimitive.Root.Props) {
  const props = { ...inputProps }

  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}
