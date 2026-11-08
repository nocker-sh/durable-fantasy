import type { AuthoredCoverage, AuthoredProjectionRow } from "#/world/town/floorplan/authored-projection-types"

/** Allocate only visited floor rows; numeric coordinates remain distinct without multiplying large grid dimensions. */
export function getAuthoredProjectionRow(coverage: AuthoredCoverage, floor: number, row: number): AuthoredProjectionRow {
  const rows = coverage.get(floor) ?? new Map<number, AuthoredProjectionRow>()
  if (!coverage.has(floor)) coverage.set(floor, rows)
  const projected = rows.get(row) ?? { cells: new Map(), walls: new Set<number>() }
  if (!rows.has(row)) rows.set(row, projected)
  return projected
}
