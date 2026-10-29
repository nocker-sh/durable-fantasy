import type * as THREE from "three"
import type { Layout } from "../world"
import { buildMarket, buildCraft, buildGate, buildFields } from "../districts"
import { layoutOf } from "../../maps/layouts.ts"
import { INDOOR, buildInterior } from "../interior"
import { FIELD_LAYOUTS, FIELD_BUILDERS } from "../fields"
import { dressHouses } from "../dressing"
import { INTERIORS, interiorPlan, type Interior } from "../../town/interiors.ts"
import { HOUSES } from "../../town/houses.ts"
import { buildTown, type V2 } from "../build"

/** A district's builder, then what stands round each of its houses. */
const dressed = (map: string, build: (root: THREE.Group) => void) => (root: THREE.Group) => {
  build(root)
  dressHouses(root, map)
}

type SceneDefinition = { layout: Layout; build: (root: THREE.Group) => void; animals?: boolean; indoor?: boolean; interior?: Interior; centre: V2; middle?: V2 }

/** A room's scene: the floor plan's furniture on a dark ground, looked at from its door. */
const room = (it: Interior): SceneDefinition => ({ layout: INDOOR, build: buildInterior(it), indoor: true, interior: it, centre: [(it.x0 + it.x1) / 2, it.z1], middle: [(it.x0 + it.x1) / 2, (it.z0 + it.z1) / 2] })

/** How each map's ground is laid out and built; centre is where the residents face, middle (if not centre) where the /dev view first looks. */
const MAP_SCENES: Record<string, SceneDefinition> = {
  phanthiet: { layout: layoutOf("phanthiet"), build: dressed("phanthiet", buildTown), animals: true, centre: [19, 24] },
  "phanthiet-market": { layout: layoutOf("phanthiet-market"), build: dressed("phanthiet-market", buildMarket), centre: [24, 24] },
  "phanthiet-craft": { layout: layoutOf("phanthiet-craft"), build: dressed("phanthiet-craft", buildCraft), centre: [20, 23] },
  "phanthiet-gate": { layout: layoutOf("phanthiet-gate"), build: dressed("phanthiet-gate", buildGate), centre: [24, 18] },
  "phanthiet-fields": { layout: layoutOf("phanthiet-fields"), build: dressed("phanthiet-fields", buildFields), animals: true, centre: [21, 23] },
  ...Object.fromEntries(Object.entries(FIELD_LAYOUTS).map(([id, layout]) => [id, { layout, build: FIELD_BUILDERS[id], centre: [24, 24] as V2 }])),
  ...Object.fromEntries(INTERIORS.map((it) => [it.id, room(it)])),
}

/**
 * A map's scene; for the /dev view, also the inside of any building, homes included, on any
 * floor: `phanthiet-in-h3` is the ground floor of h3, `phanthiet-in-h3@1` the floor above.
 */
function sceneOf(map: string): SceneDefinition | undefined {
  if (MAP_SCENES[map]) return MAP_SCENES[map]
  const m = /^(.+)-in-(.+?)(?:@(\d))?$/.exec(map)
  const house = m ? HOUSES.find((h) => h.id === m[2] && h.map.split("-")[0] === m[1]) : undefined
  if (!house) return undefined
  const it = interiorPlan(house, Number(m![3] ?? 0))
  return room(it)
}

export { MAP_SCENES, sceneOf, type SceneDefinition }
