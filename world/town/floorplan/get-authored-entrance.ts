import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import type { FloorPlan } from "#/world/town/floorplan/types"
import { getAuthoredEntranceOpening } from "#/world/town/floorplan/get-authored-entrance-opening"

type Entrance = Readonly<{ horizontal: boolean; edge: number; start: number; end: number; opening: NonNullable<FloorPlan["entrance"]> }>

/** Given validated dimensions, keep the entire opening on one exterior wall and project its center and outward direction. */
export function getAuthoredEntrance(source: AuthoredPlan): Entrance {
  const horizontal = source.entrySide === "n" || source.entrySide === "s"
  const along = source.entry[horizontal ? 0 : 1]
  const edge = source.entry[horizontal ? 1 : 0]
  const expected = source.entrySide === "n" || source.entrySide === "w" ? 0 : (horizontal ? source.depth : source.width) - 1
  const start = along - (source.entryWidth - 1) / 2
  const end = start + source.entryWidth
  const isOnExteriorWall = ["n", "s", "w", "e"].includes(source.entrySide) && source.entry.every(Number.isFinite) && edge === expected
  const hasWholeOpeningSpan = Number.isSafeInteger(start) && start >= 1 && end <= (horizontal ? source.width : source.depth) - 1
  if (!isOnExteriorWall || !hasWholeOpeningSpan) throw new Error("Authored entrance must fit one exterior wall")
  return { horizontal, edge, start, end, opening: getAuthoredEntranceOpening(source) }
}
