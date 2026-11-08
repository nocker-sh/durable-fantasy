import { pick } from "#/world/scene/pick"
import type { RGB } from "#/lib/graphics/pixel-types"
import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"
import { TUFTS, SPRIGS } from "#/world/scene/terrain"
import { stampAt } from "#/world/scene/helpers/terrain/stamp-at"
import { lvl } from "#/world/scene/helpers/terrain/lvl"

/**
 * Old, much-walked cobbles, not a tidy pavement: stones of uneven tone with grain in them, lit at
 * the upper left; earth and moss in the joints, the moss spilling out over the stones' edges where
 * it is damp; stones chipped, cracked by the frost, sunk lower than the rest, or gone altogether
 * (earth and grass in the hole); dark grime and mud splashed about; and towards the edge (`edge`
 * 0–1) more and more stones missing, so the road crumbles into the ground beside it.
 */
type Props = {
  x: number
  z: number
  sx: number
  sy: number
  scale: number
  ramp: string
  base: number
  seed: number
  rows?: boolean
  edge?: number
}

export function cobble(props: Props): RGB {
  const rows = props.rows === undefined ? true : props.rows
  const edge = props.edge === undefined ? 0 : props.edge

  const v = props.z * props.scale,
    row = Math.floor(v)
  const u = props.x * props.scale + (rows ? (row % 2) * 0.5 + (hash2(row, 0, props.seed) - 0.5) * 0.3 : 0)
  const c = Math.floor(u)
  const fu = u - c,
    fv = v - row
  // rounded stone: distance from centre, each a slightly different shape
  const dx = (fu - 0.5) * 2,
    dz = (fv - 0.5) * 2
  const sq = 2.4 + hash2(c, row, props.seed + 5) * 1.6
  const r = (Math.abs(dx) ** sq + Math.abs(dz) ** sq) ** (1 / sq)
  const m = vnoise({ x: props.x, y: props.z, scale: 0.9, seed: props.seed + 3 }) * 0.75 + vnoise({ x: props.x, y: props.z, scale: 3.1, seed: props.seed + 4 }) * 0.25 // damp, mossy places
  // a stone gone: earth in the hole, grass or moss growing in it
  if (hash2(c, row, props.seed + 21) > 0.955 - edge * 0.6) {
    if (r > 0.95) return pick({ ramp: "dirt", b: 0.15, x: props.sx, y: props.sy })
    const t = stampAt({ sx: props.sx, sy: props.sy, cell: 5, seed: props.seed + 71, shapes: TUFTS, dense: () => 0.5 })
    if (t) return lvl(m > 0.5 ? "moss" : "grass", 2 + Number(t) - 3)
    return pick({ ramp: "dirt", b: 0.32 + vnoise({ x: props.x, y: props.z, scale: 6, seed: props.seed + 22 }) * 0.25, x: props.sx, y: props.sy })
  }
  if (r > 0.82) {
    // joints: dark earth, with moss in the damp places and the odd tuft of grass
    if (m > 0.48) {
      const t = stampAt({ sx: props.sx, sy: props.sy, cell: 4, seed: props.seed + 70, shapes: SPRIGS, dense: () => 0.8 })
      return t ? lvl("moss", 2 + Number(t) - 3) : pick({ ramp: "moss", b: 0.25 + hash2(props.sx, props.sy, 6) * 0.2, x: props.sx, y: props.sy })
    }
    if (vnoise({ x: props.x, y: props.z, scale: 1.3, seed: props.seed + 3 }) > 0.66) return pick({ ramp: "grass", b: 0.3 + hash2(props.sx, props.sy, 2) * 0.3, x: props.sx, y: props.sy })
    return pick({ ramp: "dirt", b: 0.12 + hash2(props.sx, props.sy, 5) * 0.12, x: props.sx, y: props.sy })
  }
  // moss creeping out of the joints over the stone's rim
  if (m > 0.58 && r > 0.82 - (m - 0.58) * 2.2 && hash2(props.sx, props.sy, props.seed + 8) > 0.25)
    return pick({ ramp: "moss", b: 0.35 + hash2(props.sx, props.sy, 9) * 0.35, x: props.sx, y: props.sy })
  const b = { value: props.base + (hash2(c, row, props.seed) - 0.5) * 0.3 }
  b.value += (-dx - dz) * 0.09 // lit from upper-left
  if (hash2(c, row, props.seed + 23) > 0.88) b.value -= 0.18 // a sunken stone, in shadow
  if (r > 0.7) b.value -= 0.12
  // chips knocked off the rim
  if (r > 0.62 && hash2(props.sx >> 1, props.sy >> 1, props.seed + 24) > 0.86) return pick({ ramp: "dirt", b: 0.2, x: props.sx, y: props.sy })
  // grit and wear in the stone
  if (hash2(props.sx, props.sy, props.seed + 7) > 0.93) b.value -= 0.15
  if (hash2(props.sx, props.sy, props.seed + 17) > 0.97) b.value += 0.12
  // grime: dark stains in broad patches, and mud splashed up from the road
  const grime = vnoise({ x: props.x, y: props.z, scale: 0.55, seed: props.seed + 31 })
  if (grime > 0.6) b.value -= (grime - 0.6) * 0.9
  if (vnoise({ x: props.x, y: props.z, scale: 1.7, seed: props.seed + 41 }) > 0.7 && hash2(props.sx >> 1, props.sy >> 1, props.seed + 42) > 0.8)
    return pick({ ramp: "mud", b: 0.3 + hash2(props.sx, props.sy, 43) * 0.3, x: props.sx, y: props.sy })
  // here and there a stone cracked across by the frost
  if (hash2(c, row, props.seed + 13) > 0.9 && Math.abs(fu - fv + (hash2(c, row, props.seed + 14) - 0.5) * 0.4) < 0.06) b.value -= 0.3
  return pick({ ramp: props.ramp, b: b.value, x: props.sx, y: props.sy, dither: 0.45 })
}
