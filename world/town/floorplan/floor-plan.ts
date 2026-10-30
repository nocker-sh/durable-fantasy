import { HOUSES } from "#/world/town/houses"
import type { FloorPlan } from "#/world/town/floorplan/types"
import { planOf } from "#/world/town/floorplan/plan-of"

const memo = new Map<string, FloorPlan>()

/** Every building's plan, worked out once. */
export function floorPlan(id: string): FloorPlan {
  const cached = memo.get(id)
  if (cached) return cached

  const house = HOUSES.find((house) => house.id === id)
  if (!house) throw new RangeError(`Unknown building: ${id}`)

  const plan = planOf(house)
  memo.set(id, plan)
  return plan
}
