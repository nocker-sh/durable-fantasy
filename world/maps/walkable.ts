import type { Cell, MapDefinition } from "#/world/maps/types"

export function walkable(map: MapDefinition, cell: Cell): boolean {
  return cell[0] >= 0 && cell[1] >= 0 && cell[0] < map.size && cell[1] < map.size && map.rows[cell[1]][cell[0]] === "."
}
