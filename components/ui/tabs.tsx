"use client"

import { withoutKeys } from "#/lib/engine/without-keys"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva } from "class-variance-authority"
import { cn } from "cn"

export function Tabs(inputProps: TabsPrimitive.Root.Props) {
  const className = inputProps.className
  const orientationValue = inputProps.orientation
  const orientation = orientationValue === undefined ? "horizontal" : orientationValue
  const props = withoutKeys(inputProps, ["className", "orientation"])

  return <TabsPrimitive.Root data-slot="tabs" data-orientation={orientation} className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)} {...props} />
}

export const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-4xl p-[3px] text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:rounded-2xl data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)
