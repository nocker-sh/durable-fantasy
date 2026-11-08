"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { inputGroupAddonVariants } from "#/components/ui/input-group"

export function InputGroupAddon(inputProps: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  const className = inputProps.className
  const alignValue = inputProps.align
  const align = alignValue === undefined ? "inline-start" : alignValue
  const props = withoutKeys(inputProps, ["className", "align"])

  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if (e.target instanceof Element && e.target.closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}
