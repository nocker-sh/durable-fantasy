import type { RGB } from "#/lib/graphics/pixel-types"

import type { Stamp } from "#/world/scene/terrain"
const PEBBLES: Stamp[] = [
  [".55.", "5442", ".22."],
  ["54", "42"],
  [".54", "542", ".2."],
  ["554.", "4442", ".222"],
]
import { RAMPS } from "#/world/scene/pix"

import { hash2 } from "#/lib/engine/hash2"

import { stampAt } from "#/world/scene/helpers/terrain/stamp-at"
import { lvl } from "#/world/scene/helpers/terrain/lvl"
import { patchLevel } from "#/world/scene/helpers/terrain/patch-level"

type Props = {
  x: number
  z: number
  sx: number
  sy: number
  base?: number
  ramp?: string
}

export function dirt(props: Props): RGB {
  const base = props.base === undefined ? 0.45 : props.base
  const ramp = props.ramp === undefined ? "dirt" : props.ramp

  const n = RAMPS[ramp].length
  const b0 = Math.round(base * (n - 1))
  const lv = patchLevel({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, levels: [b0, b0 + 1, b0], scale: 0.9, seed: 9 })
  // pebbles, each lit on its top and shadowed below
  const p = stampAt({ sx: props.sx, sy: props.sy, cell: 8, seed: 50, shapes: PEBBLES, dense: () => 0.3 })
  if (p) return lvl("stone", Number(p) - 1)
  // a crack or a dropped twig now and then
  if (hash2(props.sx >> 2, props.sy, 52) > 0.985) return lvl(ramp, lv - 1)
  return lvl(ramp, lv)
}
