import { MAP_SCENES } from "#/world/scene/runtime/definitions"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"
import { HOUSES } from "#/world/town/houses"
import { interiorPlan } from "#/world/town/interior-plan"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/layouts/indoor"
import { ROOM_SCALE } from "#/world/town/interior-rules"
/** Developer previews may inspect private homes without registering them as playable maps. */
export function sceneOf(map: string): SceneDefinition | undefined {
  if (Object.hasOwn(MAP_SCENES, map)) return MAP_SCENES[map]
  const match = /^(.+)-in-(.+?)(?:@(\d+))?$/.exec(map)
  if (!match) return undefined
  const house = HOUSES.find((house) => house.id === match[2] && house.map.split("-")[0] === match[1])
  if (!house || Number(match[3] ?? 0) >= floorPlan(house.id).floors) return undefined
  const interior = interiorPlan(house, Number(match[3] ?? 0))
  return {
    layout: INDOOR,
    build: buildInterior(interior),
    indoor: true,
    interior,
    figureMetres: interior.authored ? ROOM_SCALE : undefined,
    centre: [(interior.x0 + interior.x1) / 2, interior.z1],
    middle: [(interior.x0 + interior.x1) / 2, (interior.z0 + interior.z1) / 2],
  }
}
