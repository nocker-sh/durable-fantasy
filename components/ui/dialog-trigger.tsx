"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

export function DialogTrigger(inputProps: DialogPrimitive.Trigger.Props) {
  const props = { ...inputProps }

  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}
