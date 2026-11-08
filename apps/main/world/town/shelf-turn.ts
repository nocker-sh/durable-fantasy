import type { ShelfSpec } from "#/world/town/shelf"

export const shelfTurn = (front: ShelfSpec["front"]): 0 | 1 | 2 | 3 => (front === "s" ? 0 : front === "w" ? 1 : front === "n" ? 2 : 3)
