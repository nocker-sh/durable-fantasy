import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "cn"
type Props = TabsPrimitive.Root.Props

/** Keep the game tab root's layout while forwarding the primitive's state and controls. */
export function Tabs(props: Props) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} className={cn("flex min-h-0 flex-col", props.className)} />
}
