"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

export function TooltipTrigger(inputProps: TooltipPrimitive.Trigger.Props) {
  const props = { ...inputProps }

  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}
