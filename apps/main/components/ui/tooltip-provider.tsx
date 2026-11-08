"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

export function TooltipProvider(inputProps: TooltipPrimitive.Provider.Props) {
  const delayValue = inputProps.delay
  const delay = delayValue === undefined ? 0 : delayValue
  const props = withoutKeys(inputProps, ["delay"])

  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}
