import type * as THREE from "three"
import { VILLAGE, type Layout } from "../world"
import { MARKET, CRAFT, GATE, buildMarket, buildCraft, buildGate } from "../districts"
import { INDOOR, buildInterior } from "../interior"
import { FIELD_LAYOUTS, FIELD_BUILDERS } from "../fields"
import { dressHouses } from "../dressing"
import { INTERIORS } from "../../town/interiors.ts"
import { buildTown, type V2 } from "../build"

/** A district's builder, then what stands round each of its houses. */
const dressed = (map: string, build: (root: THREE.Group) => void) => (root: THREE.Group) => {
  build(root)
  dressHouses(root, map)
}

/** How each map's ground is laid out and built. */
const MAP_SCENES: Record<string, { layout: Layout; build: (root: THREE.Group) => void; animals?: boolean; indoor?: boolean; centre: V2 }> = {
  phanthiet: { layout: VILLAGE, build: dressed("phanthiet", buildTown), animals: true, centre: [19, 24] },
  "phanthiet-market": { layout: MARKET, build: dressed("phanthiet-market", buildMarket), centre: [24, 24] },
  "phanthiet-craft": { layout: CRAFT, build: dressed("phanthiet-craft", buildCraft), centre: [20, 23] },
  "phanthiet-gate": { layout: GATE, build: dressed("phanthiet-gate", buildGate), centre: [24, 18] },
  ...Object.fromEntries(Object.entries(FIELD_LAYOUTS).map(([id, layout]) => [id, { layout, build: FIELD_BUILDERS[id], centre: [24, 24] as V2 }])),
  ...Object.fromEntries(INTERIORS.map((it) => [it.id, { layout: INDOOR, build: buildInterior(it), indoor: true, centre: [(it.x0 + it.x1) / 2, it.z1] as V2 }])),
}

type SceneDefinition = (typeof MAP_SCENES)[string]

export { MAP_SCENES, type SceneDefinition }
