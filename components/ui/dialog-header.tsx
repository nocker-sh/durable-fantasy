"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import * as React from "react"
import { cn } from "cn"

export function DialogHeader(inputProps: React.ComponentProps<"div">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />
}
