import type { Cell, MapDefinition } from "#/world/maps/types"

export function walkable(map: Pick<MapDefinition, "size" | "rows">, cell: Cell): boolean {
  return (
    Number.isSafeInteger(map.size) &&
    map.size > 0 &&
    Array.isArray(cell) &&
    cell.length === 2 &&
    cell.every(Number.isSafeInteger) &&
    cell[0] >= 0 &&
    cell[1] >= 0 &&
    cell[0] < map.size &&
    cell[1] < map.size &&
    map.rows[cell[1]]?.[cell[0]] === "."
  )
}
