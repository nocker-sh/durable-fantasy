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

/** A laid-stone wall: blocks of uneven size and tone, dark mortar, damp and moss along the foot. */
export function stoneWall(props: Props): RGB {
  const v = props.H - 1 - props.y
  const row = Math.floor(props.y / 9),
    bw = 14 + Math.floor(hash2(row, 0, props.seed) * 6)
  const u = props.x / bw + (row % 2) * 0.5 + hash2(row, 1, props.seed) * 0.3,
    c = Math.floor(u),
    fu = u - c,
    fv = props.y / 9 - row
  if (fu < 0.07 || fv > 0.86) return v < 10 && hash2(props.x, props.y, props.seed + 3) > 0.55 ? lvl("moss", 2) : lvl("stone", 0)
  const l = { value: 2 + (hash2(c, row, props.seed) > 0.7 ? 1 : hash2(c, row, props.seed) < 0.18 ? -1 : 0) }
  if (fv < 0.18) l.value += 1
  else if (fv > 0.7) l.value -= 1
  if (v < 14 && bayer(props.x, props.y) + 0.47 < (14 - v) / 20) l.value -= 1 // damp rising from the ground
  if (hash2(props.x, props.y, props.seed + 5) > 0.94) l.value -= 1
  if (v < 8 && hash2(props.x >> 1, props.y >> 1, props.seed + 6) > 0.8) return lvl("moss", 2 + (hash2(props.x, props.y, 7) > 0.5 ? 1 : 0))
  return lvl("stone", l.value)
}
