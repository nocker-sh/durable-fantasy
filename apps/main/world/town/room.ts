import type { Room } from "#/world/town/house-types"

export const room = (name: string, floor: number): Room => ({ name, floor })
