import type { Room } from "#/world/town/house-types"

export const bed = (name: string, floor: number, beds: number): Room => ({ name, floor, beds })
