import type { Cell } from "#/world/maps/types"

export const cellDistance = (from: Cell, to: Cell) => Math.max(Math.abs(from[0] - to[0]), Math.abs(from[1] - to[1]))
