import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"

type Props = {
  x: number
  y: number
  H: number
  seed: number
}

/**
 * One pixel of a board wall, as a tone to paint: upright planks, each a little different, the gap
 * between them a soft dark line, the left edge of each plank catching the light, and the foot
 * greyed by the wet where it meets the ground. Each plank is its own region.
 */
export function boardWall(props: Props): { ramp: string; level: number; region: number } {
  const v = props.H - 1 - props.y
  const k = Math.floor(props.x / 7),
    f = props.x - k * 7
  const wash = vnoise({ x: props.x, y: props.y, scale: 0.04, seed: props.seed + 5 })
  if (f === 0) return { ramp: "board", level: 1.3 + wash * 0.4, region: -1 }
  const l = { value: 3 + (hash2(k, 0, props.seed) - 0.5) * 0.9 + (wash - 0.5) * 0.8 }
  if (f === 1) l.value += 0.5
  else if (f === 6) l.value -= 0.5
  if (hash2(props.x >> 1, props.y >> 1, props.seed + 4) > 0.99) l.value -= 1 // a knot
  // boards weathered grey in patches, dark streaks running down from the eaves, rust under the nails
  const stain = vnoise({ x: props.x, y: props.y, scale: 0.05, seed: props.seed + 20 })
  if (stain > 0.7) return { ramp: "stone", level: 2.4 + (wash - 0.5) + (f === 1 ? 0.5 : 0), region: k }
  if (stain > 0.6) l.value -= 0.6
  if (hash2(k, 0, props.seed + 9) > 0.7 && props.y < props.H * (0.25 + hash2(k, 1, props.seed + 9) * 0.5)) l.value -= 0.7
  const nail = (props.y + 3) % 22
  if (f >= 2 && f <= 4 && nail < 5 && hash2(k, (props.y + 3) / 22 | 0, props.seed + 10) > 0.4) return { ramp: nail < 2 && f === 3 ? "iron" : "redsand", level: nail < 2 && f === 3 ? 1 : 1.6, region: k }
  // greyed by the wet at the foot, with a ragged top edge
  const wet = 12 + vnoise({ x: props.x, y: 0, scale: 0.3, seed: props.seed + 6 }) * 6
  if (v < wet) return { ramp: "stone", level: 2.6 + (wash - 0.5) * 0.6 + (f === 1 ? 0.5 : 0), region: k }
  return { ramp: "board", level: l.value, region: k }
}
