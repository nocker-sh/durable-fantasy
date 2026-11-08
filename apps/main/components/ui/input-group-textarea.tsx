"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import * as React from "react"
import { cn } from "cn"
import { Textarea } from "#/components/ui/textarea"

export function InputGroupTextarea(inputProps: React.ComponentProps<"textarea">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <Textarea
      data-slot="input-group-control"
      className={cn("flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent", className)}
      {...props}
    />
  )
}
