import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "cn"
type Props = TabsPrimitive.Panel.Props

export function TabsContent(props: Props) {
  return <TabsPrimitive.Panel data-slot="tabs-content" {...props} className={cn("min-h-0 flex-1 outline-none", props.className)} />
}
