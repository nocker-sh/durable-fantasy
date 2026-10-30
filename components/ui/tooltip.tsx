"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

export function Tooltip(inputProps: TooltipPrimitive.Root.Props) {
  const props = { ...inputProps }

  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}
