import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

type Props = TooltipPrimitive.Trigger.Props

/** 対象のフォーカスとポインター操作をツールチップへつなぐ。 */
export function TooltipTrigger(props: Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}
