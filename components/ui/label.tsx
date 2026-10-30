"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import * as React from "react"
import { cn } from "cn"

function Label(inputProps: React.ComponentProps<"label">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
