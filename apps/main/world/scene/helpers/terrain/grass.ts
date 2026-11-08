import type { RGB } from "#/lib/graphics/pixel-types"
import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"

const PETALS: RGB[][] = [
  ["#f2eee2", "#f0d060"],
  ["#e08ab0", "#f2eee2"],
  ["#9a8ac8", "#f0d060"],
  ["#f0d060", "#c08040"],
].map((p) => p.map(hex))

import type { Stamp } from "#/world/scene/terrain"
const CLOVER: Stamp[] = [
  [".p.", "pcp", ".p."],
  ["p.p", ".c.", "p.p"],
  ["pp", "pc"],
]
import { RAMPS } from "#/world/scene/pix"

import { vnoise } from "#/lib/engine/vnoise"
import { TUFTS, SPRIGS } from "#/world/scene/terrain"
import { stampAt } from "#/world/scene/helpers/terrain/stamp-at"
import { lvl } from "#/world/scene/helpers/terrain/lvl"
import { patchLevel } from "#/world/scene/helpers/terrain/patch-level"

type Props = {
  x: number
  z: number
  sx: number
  sy: number
  ramp?: string
  bias?: number
}

export function grass(props: Props): RGB {
  const ramp = props.ramp === undefined ? "grass" : props.ramp
  const bias = props.bias === undefined ? 0 : props.bias

  const n = RAMPS[ramp].length
  const shift = Math.round(bias * (n - 1))
  const base = patchLevel({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, levels: n >= 6 ? [1, 2, 2, 3] : [1, 2, 2], scale: 0.42, seed: 1 }) + shift
  // tufts thick where the grass is lush, sparse where it is thin; sprigs in between
  const lush = vnoise({ x: props.x, y: props.z, scale: 0.6, seed: 5 })
  const t =
    stampAt({ sx: props.sx, sy: props.sy, cell: 9, seed: 40, shapes: TUFTS, dense: () => 0.25 + lush * 0.55 }) ??
    stampAt({ sx: props.sx + 4, sy: props.sy + 3, cell: 5, seed: 41, shapes: SPRIGS, dense: () => 0.22 })
  if (t) return lvl(ramp, base + Number(t) - 3)
  // flowers in little clusters where they like it
  const bloom = vnoise({ x: props.x, y: props.z, scale: 0.9, seed: 11 })
  if (bloom > 0.6) {
    const f = stampAt({ sx: props.sx, sy: props.sy, cell: 7, seed: 42, shapes: CLOVER, dense: () => (bloom - 0.6) * 1.6 })
    if (f) {
      const p = PETALS[Math.min(3, Math.floor(vnoise({ x: props.x, y: props.z, scale: 0.4, seed: 12 }) * 4))]
      return f === "c" ? p[1] : p[0]
    }
  }
  return lvl(ramp, base)
}
