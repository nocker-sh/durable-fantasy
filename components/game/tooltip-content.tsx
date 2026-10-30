import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"

type Props = TooltipPrimitive.Popup.Props & Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">

/** 配置用の属性をポップアップへ渡さず、ゲーム共通の小パネルで表示する。 */
export function TooltipContent(props: Props) {
  const popupProps = { ...props }
  delete popupProps.side
  delete popupProps.sideOffset
  delete popupProps.align
  delete popupProps.alignOffset

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={props.align === undefined ? "center" : props.align}
        alignOffset={props.alignOffset === undefined ? 0 : props.alignOffset}
        side={props.side === undefined ? "top" : props.side}
        sideOffset={props.sideOffset === undefined ? 8 : props.sideOffset}
        className="isolate z-[80]"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          {...popupProps}
          className={cn("ui-panel max-w-64 bg-panel-solid/95 px-3 py-2 font-body text-xs leading-relaxed text-text data-open:animate-ui-in", props.className)}
        >
          {props.children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}
