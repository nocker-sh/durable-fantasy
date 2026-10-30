import { bayer } from "#/world/scene/bayer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { hash2 } from "#/lib/engine/hash2"
import { lvl } from "#/world/scene/textures/palette"

type Props = {
  x: number
  y: number
  H: number
  seed: number
}

/** A board wall: upright planks with dark gaps, grain, knots, and weathered grey at the foot. */
export function boardWall(props: Props): RGB {
  const v = props.H - 1 - props.y
  const k = Math.floor(props.x / 7),
    f = props.x - k * 7
  if (f === 0) return lvl("board", 0)
  const l = { value: 3 + (hash2(k, 0, props.seed) > 0.7 ? 1 : hash2(k, 0, props.seed) < 0.2 ? -1 : 0) }
  if (f === 1) l.value += 1
  if (hash2(k, props.y >> 3, props.seed + 2) > 0.8 && (props.y & 7) === 3) l.value -= 1 // grain
  if (hash2(props.x >> 1, props.y >> 1, props.seed + 4) > 0.985) l.value -= 2 // a knot
  if (v < 12 && bayer(props.x, props.y) + 0.47 < (12 - v) / 14) return lvl("stone", 2) // greyed by the wet
  return lvl("board", l.value)
}
