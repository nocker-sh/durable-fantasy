import { smooth } from "#/lib/engine/smooth"
import type { RGB } from "#/lib/graphics/pixel-types"

const WATER_LINE = -0.95

import type { Stamp } from "#/world/scene/terrain"
const LEAVES: Stamp[] = [
  [".a", "ab"],
  ["ab.", ".ba"],
  ["a.", "ba", ".b"],
]

const NEEDLES: Stamp[] = [["4..", ".3.", "..2"], ["..4", ".3.", "2.."], ["43", ".2"], ["4...", ".43.", "...2"], ["34"]]
import { pick } from "#/world/scene/pick"

import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"
import { groundH } from "#/world/scene/ground-h"
import { trailD } from "#/world/scene/trail-d"
import { TUFTS } from "#/world/scene/terrain"
import { stampAt } from "#/world/scene/helpers/terrain/stamp-at"
import { lvl } from "#/world/scene/helpers/terrain/lvl"
import { patchLevel } from "#/world/scene/helpers/terrain/patch-level"
import { grass } from "#/world/scene/helpers/terrain/grass"
import { dirt } from "#/world/scene/helpers/terrain/dirt"
import { saltCrack } from "#/world/scene/helpers/terrain/salt-crack"

/** The ground of the fields outside town. */
type Props = {
  biome: string
  x: number
  z: number
  sx: number
  sy: number
  h: number
}

export function biomeColor(props: Props): RGB {
  // hoarfrost: the world is cold all year, so pale specks lie on everything in the open
  const frost = hash2(props.sx, props.sy, 81) > 0.996 - vnoise({ x: props.x, y: props.z, scale: 0.6, seed: 82 }) * 0.008
  // a footpath: trodden bare in patches along its middle, the grass (or needles) beaten flat at its
  // sides; it comes and goes, as paths do where few feet pass
  const td = trailD(props.x, props.z) + (vnoise({ x: props.x, y: props.z, scale: 1.6, seed: 121 }) - 0.5) * 0.35
  if (td < 0.3 && props.biome !== "dune") {
    const worn = vnoise({ x: props.x, y: props.z, scale: 0.9, seed: 127 })
    if (td < 0.13 + worn * 0.08 && worn > 0.3 && hash2(props.sx, props.sy, 128) > 0.12)
      return hash2(props.sx, props.sy, 122) > 0.95 ? lvl("stone", 1) : dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: props.biome === "forest" ? 0.32 : 0.42 })
    if (hash2(props.sx >> 1, props.sy >> 1, 123) > 0.55) return props.biome === "forest" ? lvl("needles", 1) : lvl("grass", 1)
  }
  const low = (groundH(props.x + 1.2, props.z) + groundH(props.x - 1.2, props.z) + groundH(props.x, props.z + 1.2) + groundH(props.x, props.z - 1.2)) / 4 - props.h
  const damp = props.h < WATER_LINE + 0.5 ? 1 : smooth(0.02, 0.1, low)
  if ((props.biome === "meadow" || props.biome === "forest") && damp > 0 && vnoise({ x: props.x, y: props.z, scale: 0.85, seed: 124 }) > 0.78 - damp * 0.3) {
    const wet = vnoise({ x: props.x, y: props.z, scale: 2.6, seed: 125 })
    if (wet > 0.74)
      return hash2(props.sx, props.sy, 126) > 0.7 ? pick({ ramp: "frost", b: 0.55 + (wet - 0.74) * 1.5, x: props.sx, y: props.sy }) : pick({ ramp: "water", b: 0.3, x: props.sx, y: props.sy })
    if (wet > 0.42) return dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: 0.22 + (wet - 0.42) * 0.3, ramp: "mud" })
  }
  if (props.biome === "meadow") {
    // hoarfrost in the hollows: pale tips on the grass, not specks everywhere
    if (frost && vnoise({ x: props.x, y: props.z, scale: 0.5, seed: 85 }) > 0.55) return lvl("frost", 3)
    const v = vnoise({ x: props.x, y: props.z, scale: 0.35, seed: 84 })
    return v > 0.62
      ? grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "wild", bias: 0.04 })
      : grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "grass", bias: -0.02 + v * 0.08 })
  }
  if (props.biome === "dune") {
    // red and white sand in bands, with wind ripples across them and frost on the lee sides
    const band = vnoise({ x: props.x * 0.6, y: props.z * 0.6, scale: 0.25, seed: 85 })
    const ripple = Math.sin((props.x * 0.92 + props.z * 0.38) * 9 + vnoise({ x: props.x, y: props.z, scale: 0.8, seed: 86 }) * 6)
    const b = { value: 0.44 + band * 0.2 + (ripple > 0.82 ? 0.08 : ripple < -0.86 ? -0.08 : 0) }
    const lee = groundH(props.x + 0.3, props.z + 0.1) - props.h > 0.06
    if (lee && hash2(props.sx, props.sy, 87) > 0.7) return pick({ ramp: "frost", b: 0.55 + hash2(props.sx, props.sy, 88) * 0.3, x: props.sx, y: props.sy })
    if (vnoise({ x: props.x, y: props.z, scale: 0.5, seed: 89 }) > 0.78 && hash2(props.sx >> 1, props.sy >> 2, 90) > 0.6)
      return pick({ ramp: "thatch", b: 0.35 + hash2(props.sx, props.sy, 91) * 0.3, x: props.sx, y: props.sy }) // dry grass
    // the red and the white bleed into each other at the edges of the bands
    const white = band + (hash2(props.sx >> 1, props.sy >> 1, 103) - 0.5) * 0.12 + (vnoise({ x: props.x, y: props.z, scale: 1.6, seed: 104 }) - 0.5) * 0.1 > 0.55
    return pick({ ramp: white ? "sand" : "redsand", b: b.value, x: props.sx, y: props.sy })
  }
  if (props.biome === "coast") {
    if (props.h < WATER_LINE + 0.35)
      return pick({ ramp: "sand", b: 0.5 + vnoise({ x: props.x, y: props.z, scale: 3, seed: 92 }) * 0.3 - (props.h < WATER_LINE + 0.1 ? 0.18 : 0), x: props.sx, y: props.sy })
    if (frost) return pick({ ramp: "frost", b: 0.6, x: props.sx, y: props.sy })
    const steep = Math.abs(groundH(props.x + 0.25, props.z) - props.h) + Math.abs(groundH(props.x, props.z + 0.25) - props.h) > 0.3
    if (steep) return pick({ ramp: "stone", b: 0.32 + vnoise({ x: props.x, y: props.z, scale: 2, seed: 93 }) * 0.35, x: props.sx, y: props.sy })
    return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "wild", bias: vnoise({ x: props.x, y: props.z, scale: 0.4, seed: 94 }) * 0.06 })
  }
  if (props.biome === "forest") {
    // the forest floor: fallen needles in strokes, moss in cushions, a few leaves blown in
    const v = vnoise({ x: props.x, y: props.z, scale: 0.45, seed: 95 })
    if (v > 0.58) {
      const ml = patchLevel({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, levels: [2, 3], scale: 1.1, seed: 96 })
      const t = stampAt({ sx: props.sx, sy: props.sy, cell: 7, seed: 97, shapes: TUFTS, dense: () => 0.55 })
      return lvl("moss", t ? ml + Number(t) - 3 : ml)
    }
    // the moss reaches out over the needles in tufts, so its edge is ragged
    if (v > 0.5) {
      const t = stampAt({ sx: props.sx, sy: props.sy, cell: 6, seed: 102, shapes: TUFTS, dense: () => (v - 0.5) * 9 })
      if (t) return lvl("moss", 2 + Number(t) - 3)
    }
    const nl = patchLevel({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, levels: [1, 2, 2], scale: 0.8, seed: 99 })
    const nd = stampAt({ sx: props.sx, sy: props.sy, cell: 4, seed: 98, shapes: NEEDLES, dense: () => 0.7 })
    if (nd) return lvl("needles", nl + Number(nd) - 2)
    const lf = stampAt({ sx: props.sx, sy: props.sy, cell: 11, seed: 100, shapes: LEAVES, dense: () => (vnoise({ x: props.x, y: props.z, scale: 0.7, seed: 101 }) > 0.55 ? 0.6 : 0.05) })
    if (lf) return lvl("autumn", lf === "a" ? 3 : 2)
    return lvl("needles", nl)
  }
  if (props.biome === "highland") {
    // the highland: pale pampas grass in sweeping drifts, short turf between them, frost on the shadowed side
    if (frost) return lvl("frost", 3)
    const steep = Math.abs(groundH(props.x + 0.25, props.z) - props.h) + Math.abs(groundH(props.x, props.z + 0.25) - props.h) > 0.3
    if (steep) return pick({ ramp: "stone", b: 0.34 + vnoise({ x: props.x, y: props.z, scale: 2, seed: 140 }) * 0.3, x: props.sx, y: props.sy })
    // the drifts' edges fray into the turf in pixels, not in a line
    const drift = vnoise({ x: props.x, y: props.z, scale: 0.22, seed: 141 }) + Math.sin(props.x * 0.21 + props.z * 0.09) * 0.12 + (hash2(props.sx, props.sy, 143) - 0.5) * 0.14
    if (drift > 0.46) {
      // strokes of dry stalks, leaning the way the wind combs them
      const lean = hash2((props.sx + (props.sy >> 1)) >> 1, props.sy >> 2, 142)
      return pick({ ramp: "thatch", b: 0.34 + Math.min(0.2, (drift - 0.46) * 0.5) + (lean > 0.72 ? 0.12 : lean < 0.2 ? -0.1 : 0), x: props.sx, y: props.sy })
    }
    return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "wild", bias: 0.02 + drift * 0.04 })
  }
  if (props.biome === "marsh") {
    // the marsh: rank grass and moss on the hummocks, black mud at the water's edge
    if (props.h < WATER_LINE + 0.12) return dirt({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, base: 0.16 + vnoise({ x: props.x, y: props.z, scale: 2, seed: 143 }) * 0.12, ramp: "mud" })
    if (props.h < WATER_LINE + 0.3 && hash2(props.sx >> 1, props.sy >> 1, 144) > 0.35) return lvl("moss", 1 + (hash2(props.sx, props.sy, 145) > 0.6 ? 1 : 0))
    if (frost) return lvl("frost", 2)
    const v = vnoise({ x: props.x, y: props.z, scale: 0.5, seed: 146 })
    if (v > 0.6) {
      const t = stampAt({ sx: props.sx, sy: props.sy, cell: 6, seed: 147, shapes: TUFTS, dense: () => 0.6 })
      return lvl("moss", t ? 2 + Number(t) - 3 : 2)
    }
    return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "wild", bias: -0.05 + v * 0.06 })
  }
  if (props.biome === "valley") {
    // the valley: wet stone at the falls and the stream, moss over the boulders, ferny grass on the benches
    const steep = Math.abs(groundH(props.x + 0.25, props.z) - props.h) + Math.abs(groundH(props.x, props.z + 0.25) - props.h) > 0.22
    if (steep) {
      const wet = vnoise({ x: props.x, y: props.z, scale: 1.2, seed: 148 })
      return wet > 0.55 ? lvl("moss", 1 + (hash2(props.sx, props.sy, 149) > 0.5 ? 1 : 0)) : pick({ ramp: "stone", b: 0.22 + wet * 0.35, x: props.sx, y: props.sy })
    }
    if (props.h < WATER_LINE + 0.2) return pick({ ramp: "stone", b: 0.3 + hash2(props.sx >> 1, props.sy >> 1, 150) * 0.3, x: props.sx, y: props.sy })
    if (frost) return lvl("frost", 3)
    const v = vnoise({ x: props.x, y: props.z, scale: 0.4, seed: 151 })
    if (v > 0.58) {
      const ml = patchLevel({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, levels: [2, 3], scale: 1.1, seed: 152 })
      return lvl("moss", ml)
    }
    return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "grass", bias: -0.04 + v * 0.05 })
  }
  if (props.biome === "salt") {
    // the salt flat: a white crust cracked into plates, the cracks grey and the ridges along them bright
    if (props.h < WATER_LINE + 0.12) return pick({ ramp: "frost", b: 0.34 + vnoise({ x: props.x, y: props.z, scale: 1.5, seed: 153 }) * 0.2, x: props.sx, y: props.sy })
    const plate = saltCrack(props.x, props.z)
    if (plate < 0.022) return pick({ ramp: "frost", b: 0.28 + hash2(props.sx, props.sy, 154) * 0.12, x: props.sx, y: props.sy })
    if (plate < 0.05) return pick({ ramp: "frost", b: 0.9, x: props.sx, y: props.sy })
    const v = vnoise({ x: props.x, y: props.z, scale: 0.3, seed: 155 })
    if (v > 0.8 && hash2(props.sx >> 1, props.sy >> 1, 156) > 0.5) return pick({ ramp: "sand", b: 0.6 + (v - 0.68) * 0.8, x: props.sx, y: props.sy })
    return pick({ ramp: "frost", b: 0.6 + v * 0.22 + (hash2(props.sx, props.sy, 157) > 0.92 ? 0.12 : 0), x: props.sx, y: props.sy })
  }
  // the pass: thin grass between stones, frost in the hollows
  const steep = Math.abs(groundH(props.x + 0.25, props.z) - props.h) + Math.abs(groundH(props.x, props.z + 0.25) - props.h) > 0.26
  if (steep) return pick({ ramp: "stone", b: 0.3 + vnoise({ x: props.x, y: props.z, scale: 2, seed: 100 }) * 0.4, x: props.sx, y: props.sy })
  // frost lies in the hollows, thinning out at the edges into the grass
  const hollow = vnoise({ x: props.x, y: props.z, scale: 0.5, seed: 101 }) - 0.66
  if (frost || hollow > (hash2(props.sx, props.sy, 105) - 0.3) * 0.12)
    return pick({ ramp: "frost", b: 0.16 + hash2(props.sx, props.sy, 102) * 0.22 + Math.min(0.12, hollow), x: props.sx, y: props.sy })
  return grass({ x: props.x, z: props.z, sx: props.sx, sy: props.sy, ramp: "wild", bias: -0.04 })
}
