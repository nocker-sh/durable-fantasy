import { getBoxLidPlan } from "#/world/town/get-box-lid-plan"
import { getRoomStorageSection } from "#/scripts/lib/get-room-storage-section"
import { getPersonalBoxLidSupport } from "#/scripts/lib/get-personal-box-lid-support"
import { getPersonalBoxLidHandle } from "#/scripts/lib/get-personal-box-lid-handle"
import type { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = { room: SettingDocument; slot: z.infer<typeof personalStorageSchema>[number]; building: SettingDocument | undefined }

/** The authored lid path uses the same grounded chest, inner parcels and room grid as the capacity proposal. */
export function getPersonalBoxLidReview(props: Props) {
  const plan = props.slot.packing,
    room = props.room,
    furniture = room.furniture?.find((piece) => piece.symbol === props.slot.furniture_symbol)
  if (!plan?.opening || !room.grid || furniture?.role !== "storage") return new Error("Personal box has no lid movement proposal")
  const support = getPersonalBoxLidSupport(props)
  if (support instanceof Error) return support
  const excludedSymbols = [furniture.symbol]
  if (support) excludedSymbols.push(support.symbol)
  const section = getRoomStorageSection(room, props.building, excludedSymbols)
  if (section instanceof Error) return section
  const cell = room.grid.cell_m,
    rect = furniture.rect

  return getBoxLidPlan({
    box: { x0: rect[0] * cell, x1: (rect[0] + rect[2]) * cell, z0: rect[1] * cell, z1: (rect[1] + rect[3]) * cell, y0: 0, y1: plan.height_m },
    wall: plan.wall_m,
    lid: plan.lid_m,
    lift: plan.opening.lift_m,
    rest: plan.opening.rest_center_m,
    contents: plan.objects.map((piece) => ({ id: piece.id, origin: piece.position_m, size: piece.size_m })),
    section: { ...section, obstacles: [...section.obstacles, ...(support?.obstacles ?? [])] },
    support: support?.top ?? null,
    handle: getPersonalBoxLidHandle(plan.lid_handle),
  })
}
