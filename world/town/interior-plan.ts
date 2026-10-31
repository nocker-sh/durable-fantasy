import { getInteriorFurnitureProjection } from "#/world/town/get-interior-furniture-projection"
import { getInteriorStairProjection } from "#/world/town/get-interior-stair-projection"
import { getInteriorEntrance } from "#/world/town/get-interior-entrance"
import { getInteriorFixtureProjection } from "#/world/town/get-interior-fixture-projection"
import type { HouseDef } from "#/world/town/house-types"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import type { Interior } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { interiorId } from "#/world/town/interior-id"
import { interiorCellOf } from "#/world/town/interior-cell-of"

const CENTRE = 24

/** Build one floor for inspection; only INTERIORS registers playable rooms. */
export function interiorPlan(h: HouseDef, floor = 0, plan = floorPlan(h.id)): Interior {
  if (!Number.isSafeInteger(floor) || floor < 0 || floor >= plan.floors) throw new RangeError(`Invalid floor ${floor} for building ${h.id}`)
  const K = ROOM_SCALE
  const w = plan.W * K,
    d = plan.D * K
  const x0 = CENTRE - w / 2,
    x1 = CENTRE + w / 2,
    z0 = CENTRE - d / 2,
    z1 = CENTRE + d / 2
  const furnishings = getInteriorFurnitureProjection({ plan, floor, x0, z0, scale: K })
  const entry = getInteriorEntrance({ entrance: plan.entrance, door: plan.door, x0, z0, z1, scale: K })
  // the keeper stands behind the counter (between it and the back partition), else at the back of the room
  const counter = furnishings.furniture.find((f) => f.kind === "counter")
  const keeper = counter ? interiorCellOf(counter.x, counter.z - counter.d / 2 - 0.35) : interiorCellOf(CENTRE + 0.25, z0 + 1.0)
  const entrance = plan.rooms.find((room) => room.floor === floor && room.name === "土間")
  const drying =
    floor === 0 && ["fisher", "greengrocer", "fruit"].includes(h.household ?? "") && entrance ? { x: x0 + 0.12, z0: z0 + entrance.z0 * K + 0.2, z1: z0 + entrance.z1 * K - 0.2 } : undefined
  const stairs = getInteriorStairProjection({ sections: plan.stairSections, floor, x0, z0, scale: K })
  const level = plan.floorLevels?.find((level) => level.floor === floor)
  const below = plan.floorLevels?.find((level) => level.floor === floor - 1)
  const fixtures = getInteriorFixtureProjection({ plan, floor, bounds: { x0, z0, x1, z1 }, scale: K })
  return {
    ...fixtures,
    below: plan.authored && level && below ? { drop: (level.elevation - below.elevation) * K, interior: interiorPlan(h, floor - 1, plan) } : undefined,
    doorHeight: plan.doorHeight ? plan.doorHeight * K : undefined,
    shellInset: plan.cellSize ? plan.cellSize * K : undefined,
    doorWidth: plan.doorWidth ? plan.doorWidth * K : undefined,
    entrance: entry.entrance,
    floorThickness: level ? level.thickness * K : undefined,
    wallHeight: level ? (level.ceiling - level.elevation) * K : undefined,
    stairSections: stairs.stairSections,
    floorOpenings: stairs.floorOpenings,
    stairBlocks: stairs.stairBlocks,
    authored: plan.authored,
    drying,
    house: h,
    floor,
    id: interiorId(h, floor),
    x0,
    z0,
    x1,
    z1,
    door: entry.door,
    arrive: entry.arrive,
    keeper,
    furniture: furnishings.furniture,
    unrenderedFurniture: furnishings.unrenderedFurniture,
  }
}
