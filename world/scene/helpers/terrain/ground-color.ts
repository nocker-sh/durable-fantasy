import { pick } from "#/world/scene/pick"
import type { RGB } from "#/lib/graphics/pixel-types"
import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"
import { groundH } from "#/world/scene/ground-h"
import { riverD } from "#/world/scene/river-d"
import { roadD } from "#/world/scene/road-d"
import { roadKind } from "#/world/scene/road-kind"
import { inRect } from "#/world/scene/in-rect"
import { currentLayout as layout } from "#/world/scene/current-layout"
import { trailD } from "#/world/scene/trail-d"
import { cobble } from "#/world/scene/helpers/terrain/cobble"
import { lvl } from "#/world/scene/helpers/terrain/lvl"
import { grass } from "#/world/scene/helpers/terrain/grass"
import { dirt } from "#/world/scene/helpers/terrain/dirt"
import { fringe } from "#/world/scene/helpers/terrain/fringe"
import { biomeColor } from "#/world/scene/helpers/terrain/biome-color"

type Props = {
  x: number
  z: number
  sx: number
  sy: number
}

export function groundColor(props: Props): RGB {
  const h = groundH(props.x, props.z)
  const dr = riverD(props.x, props.z)
  const wob = (vnoise({ x: props.x, y: props.z, scale: 2.2, seed: 31 }) - 0.5) * 0.18 + (hash2(props.sx, props.sy, 33) - 0.5) * 0.06
  // river bed / banks
  if (inRect({ x: props.x, z: props.z, r: layout().lavoir }) && dr >= layout().riverHW - 0.02)
    return cobble({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, scale: 2.2, ramp: "stone", base: 0.5, seed: 41, rows: true })
  if (inRect({ x: props.x, z: props.z, r: layout().lavStairs })) return cobble({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, scale: 2.0, ramp: "stone", base: 0.6, seed: 43, rows: false })
  if (dr < layout().riverHW + 0.05) {
    const p = hash2(props.sx >> 2, props.sy >> 2, 21)
    if (p > 0.9) return pick({ ramp: "stone", b: 0.3 + hash2(props.sx >> 2, props.sy >> 2, 22) * 0.4 - ((props.sy & 3) > 1 ? 0.1 : 0), x: props.sx, y: props.sy })
    return pick({ ramp: "mud", b: 0.35 + vnoise({ x: props.x, y: props.z, scale: 3, seed: 23 }) * 0.4, x: props.sx, y: props.sy })
  }
  if (h < -0.75 && dr < layout().riverHW + 2.5) {
    // sandy, reedy natural bank
    if (h < -0.95) return pick({ ramp: "sand", b: 0.35 + vnoise({ x: props.x, y: props.z, scale: 4, seed: 24 }) * 0.3, x: props.sx, y: props.sy })
    return vnoise({ x: props.x, y: props.z, scale: 1.5, seed: 25 }) > 0.45
      ? grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "wild", bias: 0.05 })
      : pick({ ramp: "sand", b: 0.5 + vnoise({ x: props.x, y: props.z, scale: 4, seed: 26 }) * 0.3, x: props.sx, y: props.sy })
  }
  // plaza
  const dx = props.x - layout().plaza[0],
    dz = props.z - layout().plaza[1]
  const dp = Math.hypot(dx, dz)
  if (dp < layout().plazaR + wob) {
    const a = Math.atan2(dz, dx)
    const ring = Math.floor(dp * 2.6)
    const nseg = 6 + ring * 7
    const sv = ((a + Math.PI) / (2 * Math.PI)) * nseg + (ring % 2) * 0.5
    const seg = Math.floor(sv)
    const fr = dp * 2.6 - ring,
      fa = sv - seg
    // old flagstones in rings: uneven, worn, mossy in the joints, the odd one cracked or gone
    const m = vnoise({ x: props.x, y: props.z, scale: 0.8, seed: 24 })
    if (hash2(seg, ring, 25) > 0.97)
      return fr > 0.85 || fa > 0.9
        ? pick({ ramp: "dirt", b: 0.15, x: props.sx, y: props.sy })
        : pick({ ramp: m > 0.5 ? "moss" : "dirt", b: 0.3 + hash2(props.sx, props.sy, 26) * 0.3, x: props.sx, y: props.sy })
    if (fr > 0.88 || fa > 0.92)
      return m > 0.58
        ? pick({ ramp: "moss", b: 0.25 + hash2(props.sx, props.sy, 27) * 0.25, x: props.sx, y: props.sy })
        : pick({ ramp: "dirt", b: 0.15 + hash2(props.sx, props.sy, 28) * 0.1, x: props.sx, y: props.sy })
    if (m > 0.6 && (fr > 0.8 - (m - 0.6) * 1.5 || fa > 0.86 - (m - 0.6) * 1.2) && hash2(props.sx, props.sy, 29) > 0.3)
      return pick({ ramp: "moss", b: 0.35 + hash2(props.sx, props.sy, 30) * 0.3, x: props.sx, y: props.sy })
    const b = { value: 0.6 + (hash2(seg, ring, 21) - 0.5) * 0.24 }
    b.value += fr < 0.25 ? 0.08 : fr > 0.72 ? -0.1 : 0
    if (ring === 9 || (ring === 11 && seg % 3 === 0)) b.value -= 0.28
    if (hash2(seg, ring, 31) > 0.9 && Math.abs(fr - fa + (hash2(seg, ring, 32) - 0.5) * 0.3) < 0.07) b.value -= 0.3 // a crack
    const grime = vnoise({ x: props.x, y: props.z, scale: 0.5, seed: 33 })
    if (grime > 0.6) b.value -= (grime - 0.6) * 0.8
    if (hash2(props.sx, props.sy, 23) > 0.94) b.value -= 0.15
    return pick({ ramp: "sand", b: b.value, x: props.sx, y: props.sy, dither: 0.4 })
  }
  // roads
  const rd = roadD(props.x, props.z)
  if (rd < wob * 0.8) {
    const k = roadKind(props.x, props.z)
    if (k === 1) {
      // thin ice in the low places between the stones
      const ice = vnoise({ x: props.x, y: props.z, scale: 0.9, seed: 111 })
      if (ice > 0.84 && rd < -0.15)
        return hash2(props.sx >> 1, props.sy, 112) > 0.93
          ? pick({ ramp: "frost", b: 0.95, x: props.sx, y: props.sy })
          : pick({ ramp: "frost", b: 0.4 + (ice - 0.84) * 2 + hash2(props.sx, props.sy, 113) * 0.08, x: props.sx, y: props.sy })
      // towards the edge the stones give out and the verge's earth and grass come in
      const edge = Math.max(0, (rd + 0.45) / 0.45)
      if (rd > -0.12) return cobble({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, scale: 5, ramp: "stone", base: 0.5, seed: 15, rows: true, edge: edge }) // kerb
      // here and there in the middle too a few stones have gone, and grass grows in the hole
      const gone = vnoise({ x: props.x, y: props.z, scale: 0.85, seed: 121 }) > 0.8 ? 0.45 + (vnoise({ x: props.x, y: props.z, scale: 0.85, seed: 121 }) - 0.8) * 2 : 0
      return cobble({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, scale: 3.3, ramp: "stone", base: 0.6, seed: 11, rows: true, edge: Math.max(edge * 0.6, gone) })
    }
    if (k === 3) return cobble({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, scale: 2.2, ramp: "sand", base: 0.64, seed: 13, rows: false, edge: Math.max(0, (rd + 0.4) / 0.4) * 0.6 })
    // dirt road: packed lighter along the middle where feet go, uneven earth and pebbles to the
    // sides, grass reaching in at the edges. No drawn lines along it: at a distance they read as
    // stray stripes rather than ruts.
    const w = 0.9,
      dist = rd + w
    if (rd > -0.3) {
      const f = fringe({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, reach: (rd + 0.3) * 2.2 })
      if (f) return f
    }
    // grass creeping in: tufts down the crown between the wheel tracks, and tongues of it from the verge
    if (rd < -0.3 && rd > -0.75 && vnoise({ x: props.x, y: props.z, scale: 2.4, seed: 64 }) > 0.66) {
      const f = fringe({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, reach: 0.5 + (vnoise({ x: props.x, y: props.z, scale: 2.4, seed: 64 }) - 0.66) * 1.5 })
      if (f) return f
    }
    if (rd > -0.55 && vnoise({ x: props.x, y: props.z, scale: 0.9, seed: 65 }) > 0.72) {
      const f = fringe({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, reach: 0.7 })
      if (f) return f
    }
    const worn = dist < 0.45 + (vnoise({ x: props.x, y: props.z, scale: 1.4, seed: 63 }) - 0.5) * 0.3
    return dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: worn ? 0.55 : 0.45 })
  }
  if (rd < 0.3 + wob) {
    // the verge: worn bare in patches beside the road
    if (vnoise({ x: props.x, y: props.z, scale: 1.8, seed: 55 }) > 0.45 + rd * 1.2) return dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: 0.5 })
  }
  const biome = layout().biome
  if (biome) return biomeColor({ biome: biome, x: props.x, z: props.z, sx: props.sx, sy: props.sy, h: h })
  // terrace
  if (inRect({ x: props.x, z: props.z, r: layout().terrace }) || inRect({ x: props.x, z: props.z, r: layout().stairs })) {
    if (inRect({ x: props.x, z: props.z, r: layout().stairs })) return cobble({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, scale: 2, ramp: "sand", base: 0.7, seed: 17, rows: false })
    if (inRect({ x: props.x, z: props.z, r: layout().graveyard })) return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "leaf2", bias: 0.1 })
    return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "grass", bias: 0.08 })
  }
  for (const f of layout().fields)
    if (inRect({ x: props.x, z: props.z, r: f, pad: wob * 0.5 })) {
      const t = (f.axis === "x" ? props.z : props.x) * 3
      const ff = t - Math.floor(t)
      return dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: ff < 0.45 ? 0.55 : ff < 0.6 ? 0.25 : 0.38 })
    }
  if (inRect({ x: props.x, z: props.z, r: layout().pigpen, pad: wob })) {
    const puddle = vnoise({ x: props.x, y: props.z, scale: 1.4, seed: 61 }) > 0.78
    if (puddle) return pick({ ramp: "water", b: 0.35 + (hash2(props.sx, props.sy, 3) > 0.9 ? 0.4 : 0), x: props.sx, y: props.sy })
    return dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: 0.3, ramp: "mud" })
  }
  for (const g of layout().gardens)
    if (inRect({ x: props.x, z: props.z, r: g, pad: wob * 0.3 })) {
      const t = props.z * 2.5,
        ff = t - Math.floor(t)
      if (props.x - g.x0 < 0.15 || g.x1 - props.x < 0.15) return pick({ ramp: "wood", b: 0.5, x: props.sx, y: props.sy })
      return dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: ff < 0.55 ? 0.5 : 0.22 })
    }
  for (const entry of layout().dirtPatches) {
    const a = entry[0]
    const b = entry[1]
    const c = entry[2]
    const d = entry[3]
    if (inRect({ x: props.x, z: props.z, r: { x0: a, z0: b, x1: c, z1: d }, pad: wob * 1.5 })) {
      if (hash2(props.sx >> 1, props.sy, 71) > 0.97) return pick({ ramp: "thatch", b: 0.7, x: props.sx, y: props.sy }) // straw
      return dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: 0.48 })
    }
  }
  if (inRect({ x: props.x, z: props.z, r: layout().pasture })) return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "grass", bias: 0.06 })
  // the way worn from each door to the road (maps/layouts.ts): bare in the middle, the grass beaten
  // down and thin at its sides, wider at the door where feet turn
  const td = trailD(props.x, props.z) + (vnoise({ x: props.x, y: props.z, scale: 1.8, seed: 131 }) - 0.5) * 0.22
  if (td < 0.42) {
    if (td < 0.2 && hash2(props.sx, props.sy, 132) > 0.08)
      return hash2(props.sx, props.sy, 133) > 0.96
        ? lvl("stone", 1)
        : dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: 0.4 + vnoise({ x: props.x, y: props.z, scale: 2.2, seed: 134 }) * 0.15 })
    if (hash2(props.sx >> 1, props.sy >> 1, 135) > 0.5 - (0.42 - td)) return lvl("grass", 1)
  }
  // hoarfrost lingering in the shaded hollows, pale on the grass tips
  if (hash2(props.sx, props.sy, 81) > 0.985 && vnoise({ x: props.x, y: props.z, scale: 0.45, seed: 136 }) > 0.6) return lvl("frost", 3)
  // fallen leaves blown into drifts
  if (vnoise({ x: props.x, y: props.z, scale: 0.7, seed: 114 }) > 0.72 && hash2(props.sx >> 1, props.sy >> 1, 115) > 0.9)
    return pick({ ramp: "autumn", b: 0.3 + hash2(props.sx, props.sy, 116) * 0.6, x: props.sx, y: props.sy })
  // wilder outside town
  const town = Math.hypot((props.x - 19) / 20, (props.z - 26) / 19)
  if (town > 0.95 + wob) return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "wild", bias: 0.02 })
  // broad patches of drier, yellower grass and of lusher, so a yard does not read as one flat green
  const dry = vnoise({ x: props.x, y: props.z, scale: 0.16, seed: 137 })
  if (dry > 0.63) return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "wild", bias: 0.04 })
  return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "grass", bias: dry < 0.35 ? 0.06 : 0 })
}
