import { mapGridSchema } from "#/world/maps/map-grid-schema"
import { assertMapWalkGrid } from "#/world/maps/assert-map-walk-grid"
import type { MapDefinition } from "#/world/maps/types"

/** Read named cells without coercion or casts; landmarks need to be in bounds, not necessarily walkable. */
export function readMapGrid(id: string, input: unknown): Pick<MapDefinition, "size" | "rows" | "places" | "npcs"> {
  const parsed = mapGridSchema.safeParse(input)
  if (!parsed.success) throw new Error(`Invalid map grid: ${id}`)
  const grid = parsed.data
  assertMapWalkGrid({ id, size: grid.size, rows: grid.rows })
  for (const cell of Object.values(grid.places)) if (cell[0] >= grid.size || cell[1] >= grid.size) throw new Error(`Invalid map place: ${id}`)
  return { size: grid.size, rows: grid.rows, npcs: [], places: grid.places }
}
