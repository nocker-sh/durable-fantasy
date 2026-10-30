import { M } from "#/world/scene/construction/materials"
import type { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { SlidingCabinetPart } from "#/world/town/sliding-cabinet-types"
type Props = Readonly<{ builder: GB; parts: readonly SlidingCabinetPart[] }>

/** The checked boards and real finger holes use the same wood as existing indoor storage. */
export function drawSlidingCabinetParts(props: Props): void {
  for (const part of props.parts) props.builder.box({ side: M.woodDark, top: M.wood, x0: part.x0, y0: part.bottom, z0: part.z0, x1: part.x1, y1: part.top, z1: part.z1, repeat: 1, bottom: true })
}
