"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "cn"

export function TabsContent(inputProps: TabsPrimitive.Panel.Props) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn("flex-1 text-sm outline-none", className)} {...props} />
}
