"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import * as React from "react"
import { cn } from "cn"
import { Input } from "#/components/ui/input"

export function InputGroupInput(inputProps: React.ComponentProps<"input">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <Input
      data-slot="input-group-control"
      className={cn("flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent", className)}
      {...props}
    />
  )
}
