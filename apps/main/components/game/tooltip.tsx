import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

type Props = TooltipPrimitive.Root.Props

/** 対象と説明の表示状態を Base UI で共有する。 */
export function Tooltip(props: Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}
