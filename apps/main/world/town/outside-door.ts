import type { HouseDef } from "#/world/town/house-types"
import type { Cell } from "#/world/town/interiors"
import { interiorCellOf } from "#/world/town/interior-cell-of"

/** The cell just outside a building's door, and one step further out (where you come back to). */
export function outsideDoor(h: HouseDef): { door: Cell; arrive: Cell } {
  const u = h.door.u
  const position =
      h.door.side === "s" ? [h.x0 + u, h.z1 + 0.55, 0, 1] : h.door.side === "n" ? [h.x1 - u, h.z0 - 0.55, 0, -1] : h.door.side === "e" ? [h.x1 + 0.55, h.z1 - u, 1, 0] : [h.x0 - 0.55, h.z0 + u, -1, 0],
    x = position[0],
    z = position[1],
    dx = position[2],
    dz = position[3]
  const door = interiorCellOf(x, z)
  return { door, arrive: [door[0] + dx * 2, door[1] + dz * 2] }
}
