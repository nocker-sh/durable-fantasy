import type { RGB } from "#/lib/graphics/pixel-types"
import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import { hash2 } from "#/lib/engine/hash2"
import type { Stamp } from "#/world/scene/terrain"
import { FLOWER_KINDS } from "#/world/scene/flower-kinds"
import type { FlowerForm } from "#/world/scene/flower-kinds"
import { stampAt } from "#/world/scene/helpers/terrain/stamp-at"
import { flowerDrift } from "#/world/scene/helpers/terrain/flower-drift"

// seen from above: a = shaded petal, b = petal, c = lit petal, h = heart
const HEADS: Stamp[] = [[".b.", "bhc", ".c."], ["bc", "ah"], ["b.c", ".h.", "a.b"], ["c"]]
const SPIKES: Stamp[] = [["c", "b", "a"], [".c", "cb", "ba"], ["c.", "b.", "ba"], ["cb"]]
const MATS: Stamp[] = [
  ["ab.", "bcb", ".ba"],
  ["bc", "ab"],
  [".b", "bc", "ab", "a."],
]
const SHAPES: Readonly<Record<FlowerForm, Stamp[]>> = { head: HEADS, plume: HEADS, flag: HEADS, spike: SPIKES, bell: SPIKES, mat: MATS }

const COLOURS = new Map(Object.entries(FLOWER_KINDS).map((entry) => [entry[0], { petals: entry[1].petals.map(hex), heart: hex(entry[1].heart) }]))

type Props = {
  biome: string
  x: number
  z: number
  sx: number
  sy: number
}

/**
 * The colour of a flower at this pixel of the ground, if a drift lies here and a flower falls on
 * it: thick in the middle of a drift, thinning to single flowers at its edge.
 */
export function driftPetal(props: Props): RGB | null {
  const drift = flowerDrift(props.biome, props.x, props.z)
  if (!drift) return null
  const kind = FLOWER_KINDS[drift.kind]
  const colours = COLOURS.get(drift.kind)
  if (!kind || !colours) return null
  const ch = stampAt({ sx: props.sx, sy: props.sy, cell: kind.form === "mat" ? 4 : 5, seed: 760, shapes: SHAPES[kind.form], dense: () => 0.12 + drift.thick * 0.8 })
  if (!ch) {
    // loose petals between the flowers where the drift is thickest
    if (drift.thick > 0.5 && hash2(props.sx, props.sy, 761) < (drift.thick - 0.5) * 0.1) return colours.petals[1]
    return null
  }
  if (ch === "h") return colours.heart
  return colours.petals[ch === "a" ? 0 : ch === "b" ? 1 : 2]
}
