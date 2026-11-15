import type * as THREE from "three"
import { WATER_Y } from "#/world/maps/ground/rules"
import { groundH } from "#/world/scene/ground-h"
import { clusters } from "#/world/scene/fields/clusters"
import { scatter } from "#/world/scene/fields/helpers/scatter/scatter"
import { offRoad } from "#/world/scene/fields/helpers/scatter/off-road"
import { verge } from "#/world/scene/fields/verge"
import { grassClumps } from "#/world/scene/fields/grass-clumps"
import { ferns } from "#/world/scene/fields/ferns"
import { flowers } from "#/world/scene/fields/flowers"
import { tufts } from "#/world/scene/fields/tufts"
import { blooms } from "#/world/scene/fields/blooms"
import { flowerDrift } from "#/world/scene/helpers/terrain/flower-drift"
import { hash2 } from "#/lib/engine/hash2"
import type { Spot } from "#/world/scene/fields/instancing"

/** Level enough for grass to stand on: not the rock of a scarp or a cliff face. */
const flat = (x: number, z: number) => {
  const h = groundH(x, z)
  return Math.abs(groundH(x + 0.25, z) - h) + Math.abs(groundH(x, z + 0.25) - h) < 0.2
}

/** Damp: low ground near water, where ferns and rank grass do best. */
const damp = (x: number, z: number) => groundH(x, z) < WATER_Y + 0.9

type Growth = Readonly<{ grass: number; wild: boolean; verges: number; ferns: number; flowers: number; dry: number; blooms: number }>

/**
 * How much of each grows on each kind of land: green grass in clumps (and how much of it along the
 * verges), ferns, flower drifts, dry tufts, and how many flowers stand in the painted drifts.
 * landscape.md「何を美しいとするか」: small things gathered in groups, thickest at the roots of big
 * ones and along the edges of the road, open ground between.
 */
const GROWTH: Readonly<Record<string, Growth>> = {
  meadow: { grass: 26, wild: false, verges: 170, ferns: 0, flowers: 10, dry: 0, blooms: 2600 },
  highland: { grass: 10, wild: true, verges: 80, ferns: 0, flowers: 4, dry: 0, blooms: 1600 },
  marsh: { grass: 24, wild: true, verges: 120, ferns: 6, flowers: 3, dry: 0, blooms: 1200 },
  valley: { grass: 20, wild: false, verges: 120, ferns: 18, flowers: 8, dry: 0, blooms: 1600 },
  forest: { grass: 10, wild: true, verges: 90, ferns: 26, flowers: 2, dry: 0, blooms: 1100 },
  coast: { grass: 16, wild: true, verges: 120, ferns: 0, flowers: 4, dry: 6, blooms: 1300 },
  pass: { grass: 8, wild: true, verges: 60, ferns: 0, flowers: 0, dry: 8, blooms: 900 },
  dune: { grass: 0, wild: true, verges: 0, ferns: 0, flowers: 0, dry: 0, blooms: 500 },
  salt: { grass: 0, wild: true, verges: 0, ferns: 0, flowers: 0, dry: 0, blooms: 700 },
}

/**
 * The undergrowth of a field outside town, laid over what its builder placed: drawn only, so the
 * walk grid the server keeps is the same with or without it.
 */
export function wildGrowth(root: THREE.Group, biome: string | undefined, seed: number) {
  const g = biome ? GROWTH[biome] : undefined
  if (!g) return
  const off = offRoad(0.85)
  const ok = (x: number, z: number) => off(x, z) && flat(x, z)
  if (g.grass) grassClumps(root, clusters(seed, g.grass, 12, 1.8, 0.6, 1.15, ok), g.wild)
  if (g.verges) {
    const edge = verge(0.55, 1.9)
    grassClumps(root, scatter({ seed: seed + 1, count: g.verges, s0: 0.55, s1: 1.05, ok: (x, z) => edge(x, z) && flat(x, z) }), g.wild)
  }
  if (g.ferns) {
    ferns(
      root,
      clusters(seed + 2, g.ferns, 7, 1.5, 0.7, 1.3, (x, z) => ok(x, z) && (biome === "forest" || damp(x, z))),
    )
  }
  if (g.flowers) flowers(root, clusters(seed + 3, g.flowers, 14, 1.6, 0.6, 1.0, ok))
  if (g.dry) tufts(root, clusters(seed + 4, g.dry, 10, 2, 0.6, 1.1, ok))
  if (g.blooms && biome) {
    // the flowers of each drift the ground is painted with, thick in its middle and thin at its edge
    const kinds = new Map<string, Spot[]>()
    const loose = offRoad(0.5)
    scatter({
      seed: seed + 5,
      count: g.blooms,
      s0: 0.75,
      s1: 1.2,
      ok: (x, z) => {
        const drift = flowerDrift(biome, x, z)
        return !!drift && hash2(Math.floor(x * 9), Math.floor(z * 9), seed) < 0.2 + drift.thick && loose(x, z) && flat(x, z)
      },
    }).forEach((s) => {
      const name = flowerDrift(biome, s.x, s.z)?.kind
      if (!name) return
      const of = kinds.get(name)
      if (of) of.push(s)
      else kinds.set(name, [s])
    })
    kinds.forEach((spots, name) => blooms(root, name, spots))
  }
}
