import { fbm } from "#/lib/engine/fbm"
import { smooth } from "#/lib/engine/smooth"
type Props = Readonly<{ x: number; z: number; h: number; cx: number; cz: number; r: number; floor: number; seed: number }>

/** Ground height `h` with a ragged-edged hollow of radius `r` around (cx, cz) sunk to `floor`. */
export function hollow(props: Props): number {
  const x = props.x,
    z = props.z,
    h = props.h,
    cx = props.cx,
    cz = props.cz,
    r = props.r,
    floor = props.floor,
    seed = props.seed
  const d =
    Math.hypot(x - cx, z - cz) +
    (fbm({
      x: x,
      y: z,
      scale: 0.35,
      seed: seed,
    }) -
      0.5) *
      1.6
  // a shelving bank down to the water, then the deep middle
  return h + (floor - h) * smooth(r, r * 0.15, d)
}
