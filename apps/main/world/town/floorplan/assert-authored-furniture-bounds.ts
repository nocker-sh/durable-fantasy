import type { AuthoredRoom } from "#/world/town/floorplan/authored-types"

/** Furniture rectangles stay in their declared room; validation never clips or shrinks them to fit. */
export function assertAuthoredFurnitureBounds(room: AuthoredRoom, piece: AuthoredRoom["furniture"][number]): void {
  const rectangle = piece.rect
  const x = rectangle[0],
    z = rectangle[1],
    width = rectangle[2],
    depth = rectangle[3]
  if (![x, z, width, depth].every(Number.isSafeInteger) || x < 0 || z < 0 || width <= 0 || depth <= 0 || x + width > room.rows[0].length || z + depth > room.rows.length)
    throw new Error(`Invalid authored furniture: ${room.id}/${piece.name}`)
}
