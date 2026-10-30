import type * as THREE from "three"
import type { Layout } from "#/world/maps/layout"
import { buildMarket } from "#/world/scene/build-market"
import { buildCraft } from "#/world/scene/build-craft"
import { buildGate } from "#/world/scene/build-gate"
import { layoutOf } from "#/world/maps/layouts"
import { INDOOR } from "#/world/maps/ground-layouts"
import { buildInterior } from "#/world/scene/build-interior"
import { FIELD_LAYOUTS } from "#/world/maps/ground-layouts"
import { FIELD_BUILDERS } from "#/world/scene/fields/maps"
import { dressHouses } from "#/world/scene/dress-houses"
import { INTERIORS } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { buildTown } from "#/world/scene/construction/town"
import type { V2 } from "#/world/scene/construction/registry"

/** A district's builder, then what stands round each of its houses. */
const dressed = (map: string, build: (root: THREE.Group) => void) => (root: THREE.Group) => {
  build(root)
  dressHouses(root, map)
}

/** How each map's ground is laid out and built; centre is where the residents face, middle (if not centre) where the /dev view first looks. */
const MAP_SCENES: Record<string, { layout: Layout; build: (root: THREE.Group) => void; animals?: boolean; indoor?: boolean; figureMetres?: number; centre: V2; middle?: V2 }> = {
  phanthiet: { layout: layoutOf("phanthiet"), build: dressed("phanthiet", buildTown), animals: true, centre: [19, 24] },
  "phanthiet-market": { layout: layoutOf("phanthiet-market"), build: dressed("phanthiet-market", buildMarket), centre: [24, 24] },
  "phanthiet-craft": { layout: layoutOf("phanthiet-craft"), build: dressed("phanthiet-craft", buildCraft), centre: [20, 23] },
  "phanthiet-gate": { layout: layoutOf("phanthiet-gate"), build: dressed("phanthiet-gate", buildGate), centre: [24, 18] },
  ...Object.fromEntries(
    Object.entries(FIELD_LAYOUTS).map((entry) => {
      const id = entry[0]
      const layout = entry[1]
      return [id, { layout, build: FIELD_BUILDERS[id], centre: [24, 24] as V2 }]
    }),
  ),
  ...Object.fromEntries(
    INTERIORS.map((it) => [
      it.id,
      {
        layout: INDOOR,
        build: buildInterior(it),
        indoor: true,
        figureMetres: it.authored ? ROOM_SCALE : undefined,
        centre: [(it.x0 + it.x1) / 2, it.z1] as V2,
        middle: [(it.x0 + it.x1) / 2, (it.z0 + it.z1) / 2] as V2,
      },
    ]),
  ),
}

type SceneDefinition = (typeof MAP_SCENES)[string]

export { MAP_SCENES, type SceneDefinition }
