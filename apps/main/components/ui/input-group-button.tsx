"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Button } from "#/components/ui/button"
import { inputGroupButtonVariants } from "#/components/ui/input-group"

export function InputGroupButton(
  inputProps: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
    VariantProps<typeof inputGroupButtonVariants> & {
      type?: "button" | "submit" | "reset"
    },
) {
  const className = inputProps.className
  const typeValue = inputProps.type
  const type = typeValue === undefined ? "button" : typeValue
  const variantValue = inputProps.variant
  const variant = variantValue === undefined ? "ghost" : variantValue
  const sizeValue = inputProps.size
  const size = sizeValue === undefined ? "xs" : sizeValue
  const props = withoutKeys(inputProps, ["className", "type", "variant", "size"])

  return <Button type={type} data-size={size} variant={variant} className={cn(inputGroupButtonVariants({ size }), className)} {...props} />
}
