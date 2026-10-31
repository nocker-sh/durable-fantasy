import { missing } from "#/world/town/get-missing-household-furniture"
import type { Room, Plan } from "#/world/town/house-types"

export const home = (rooms: Room[], furniture: string[], workshop?: string): Plan => ({
  rooms,
  hearth: true,
  kitchen: true,
  workshop,
  furniture: [...furniture, ...(rooms.some((r) => r.beds) ? missing(furniture) : [])],
})
