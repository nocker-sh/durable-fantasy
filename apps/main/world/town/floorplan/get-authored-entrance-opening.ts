import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import type { FloorPlan } from "#/world/town/floorplan/types"

/** Project a validated opening onto the exterior face rather than the center of its boundary cells. */
export function getAuthoredEntranceOpening(source: AuthoredPlan): NonNullable<FloorPlan["entrance"]> {
  const x = (source.entry[0] + 0.5) * source.cellM
  const z = (source.entry[1] + 0.5) * source.cellM
  if (source.entrySide === "n") return { point: [x, 0], outward: [0, -1] }
  if (source.entrySide === "s") return { point: [x, source.depth * source.cellM], outward: [0, 1] }
  if (source.entrySide === "w") return { point: [0, z], outward: [-1, 0] }
  return { point: [source.width * source.cellM, z], outward: [1, 0] }
}
