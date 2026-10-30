import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "cn"
type Props = TabsPrimitive.List.Props

export function TabsList(props: Props) {
  return <TabsPrimitive.List data-slot="tabs-list" {...props} className={cn("flex items-end gap-1", props.className)} />
}
