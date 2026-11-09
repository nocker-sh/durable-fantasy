import { scaleRoomPieceDimensions } from "#/world/town/scale-room-piece-dimensions"
import { getInteriorPiece } from "#/world/town/get-interior-piece"
import { projectInteriorPiecePlacement } from "#/world/town/project-interior-piece-placement"
import type { DividerKind, FloorPlan } from "#/world/town/floorplan/types"
import type { Furniture, UnrenderedFurniture } from "#/world/town/interiors"

type Props = Readonly<{ plan: Pick<FloorPlan, "pieces" | "dividers">; floor: number; x0: number; z0: number; scale: number }>
const dividerKinds: Readonly<Record<DividerKind, Furniture["kind"]>> = { 壁: "partition", 腰壁: "lowwall", カーテン: "curtain", 棚: "shelf" }

/** Keep source order, unsupported furniture and dividers explicit on the selected floor. */
export function getInteriorFurnitureProjection(props: Props) {
  const furniture: Furniture[] = [],
    unrenderedFurniture: UnrenderedFurniture[] = []
  for (const source of props.plan.pieces) {
    if (source.floor !== props.floor) continue
    const piece = getInteriorPiece({ piece: scaleRoomPieceDimensions(source, props.scale), placement: projectInteriorPiecePlacement({ ...props, rect: source }) })
    if ("kind" in piece) furniture.push(piece)
    else unrenderedFurniture.push(piece)
  }
  for (const divider of props.plan.dividers) {
    if (divider.floor === props.floor) furniture.push({ kind: dividerKinds[divider.kind], ...projectInteriorPiecePlacement({ ...props, rect: divider }), solid: true, name: divider.kind })
  }
  return { furniture, unrenderedFurniture }
}
