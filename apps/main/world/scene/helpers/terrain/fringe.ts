import type { RGB } from "#/lib/graphics/pixel-types"
import { TUFTS } from "#/world/scene/terrain"
import { stampAt } from "#/world/scene/helpers/terrain/stamp-at"
import { lvl } from "#/world/scene/helpers/terrain/lvl"

/** Grass reaching out over the edge of a path: tufts only, so the edge is ragged, not smooth. */
type Props = {
  x: number
  z: number
  sx: number
  sy: number
  reach: number
}

export function fringe(props: Props): RGB | null {
  const t = stampAt({ sx: props.sx, sy: props.sy, cell: 6, seed: 60, shapes: TUFTS, dense: () => props.reach })
  return t ? lvl("grass", 2 + Number(t) - 3) : null
}
