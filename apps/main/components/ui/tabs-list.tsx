"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { tabsListVariants } from "#/components/ui/tabs"

export function TabsList(inputProps: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  const className = inputProps.className
  const variantValue = inputProps.variant
  const variant = variantValue === undefined ? "default" : variantValue
  const props = withoutKeys(inputProps, ["className", "variant"])

  return <TabsPrimitive.List data-slot="tabs-list" data-variant={variant} className={cn(tabsListVariants({ variant }), className)} {...props} />
}
