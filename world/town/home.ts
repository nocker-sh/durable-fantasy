import type { Room, Plan } from "#/world/town/house-types"

export const home = (rooms: Room[], furniture: string[], workshop?: string): Plan => ({ rooms, hearth: true, kitchen: true, workshop, furniture })
