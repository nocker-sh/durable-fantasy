import type { MapDefinition } from "#/world/maps/types"

/** Validate the entire grid, including sparse rows, before allocating traversal state. */
export function assertMapWalkGrid(map: Pick<MapDefinition, "id" | "size" | "rows">): void {
  const size = map.size
  if (!Number.isSafeInteger(size) || size <= 0 || !Number.isSafeInteger(size * size) || !Array.isArray(map.rows) || map.rows.length !== size) throw new Error(`Invalid map walk grid: ${map.id}`)
  for (const row of map.rows) if (typeof row !== "string" || row.length !== size || /[^.#]/.test(row)) throw new Error(`Invalid map walk grid: ${map.id}`)
}
