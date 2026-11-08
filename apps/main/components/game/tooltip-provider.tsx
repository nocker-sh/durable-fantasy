import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

type Props = TooltipPrimitive.Provider.Props

/** ゲーム内のツールチップで共通の表示待ち時間を使う。 */
export function TooltipProvider(props: Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} delay={props.delay === undefined ? 150 : props.delay} />
}
