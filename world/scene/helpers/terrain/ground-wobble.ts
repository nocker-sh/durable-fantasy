import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"

type Props = {
  x: number
  z: number
  sx: number
  sy: number
}

/** How far a paved edge (the plaza's rim, a road's verge) wanders in or out at this pixel. */
export function groundWobble(props: Props): number {
  return (vnoise({ x: props.x, y: props.z, scale: 2.2, seed: 31 }) - 0.5) * 0.18 + (hash2(props.sx, props.sy, 33) - 0.5) * 0.06
}
