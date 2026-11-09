import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "cn"
type Props = TabsPrimitive.Tab.Props

/** The selected tab retains the same game colours, focus outline and primitive interactions. */
export function TabsTrigger(props: Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      {...props}
      className={cn(
        "relative cursor-pointer rounded-md px-2.5 py-0.5 font-head text-xs text-text-dim outline-none hover:text-text focus-visible:outline-1 focus-visible:outline-white/60",
        "data-active:bg-white/12 data-active:font-semibold data-active:text-white",
        props.className,
      )}
    />
  )
}
