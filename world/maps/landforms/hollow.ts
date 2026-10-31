import { fbm } from "#/lib/engine/fbm"
import { smooth } from "#/lib/engine/smooth"
export const hollow = (x: number, z: number, h: number, cx: number, cz: number, r: number, floor: number, seed: number) => {
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
