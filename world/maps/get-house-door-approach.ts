import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import type { HouseDef } from "#/world/town/house-types"

type Props = Pick<HouseDef, "x0" | "x1" | "z0" | "z1" | "door">
type Approach = Readonly<{ position: Vector2Tuple; outward: Vector2Tuple }>

/** Door offsets run along each wall in its own direction; the approach starts outside the wall. */
export function getHouseDoorApproach(house: Props): Approach {
  const offset = house.door.u
  if (house.door.side === "s") return { position: [house.x0 + offset, house.z1 + 0.3], outward: [0, 1] }
  if (house.door.side === "n") return { position: [house.x1 - offset, house.z0 - 0.3], outward: [0, -1] }
  if (house.door.side === "e") return { position: [house.x1 + 0.3, house.z1 - offset], outward: [1, 0] }
  return { position: [house.x0 - 0.3, house.z0 + offset], outward: [-1, 0] }
}
