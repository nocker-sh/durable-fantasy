import { smooth } from "#/lib/engine/smooth"
type Props = Readonly<{ x: number; z: number; cx: number; cz: number; r: number; flat: number; top: number }>

/** A rounded rise centred on (cx, cz): flat on top within `flat`, gone by `r`, `top` high. */
export function hill(props: Props): number {
  return props.top * smooth(props.r, props.flat, Math.hypot(props.x - props.cx, props.z - props.cz))
}
