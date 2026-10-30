import { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getRoomBedDefinition } from "#/scripts/lib/get-room-bed-definition"
import { getHemmedTextileCutSize } from "#/world/town/get-hemmed-textile-cut-size"
import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Check separate in-use and spare outputs on their owner's unrolled cloth, never treating nominal cut area as a wool-mass or manufacturing certificate. */
export function getBlanketCuttingReview(room: SettingDocument) {
  const materials = sleepingMaterialsSchema.safeParse(room.sleeping_materials),
    storage = personalStorageSchema.safeParse(room.personal_storage)
  if (!materials.success || !storage.success || !materials.data.blanket_cutting) return new Error("Missing blanket cutting proposal")
  const source = materials.data.blanket_cutting,
    definition = getRoomBedDefinition({ room, bedId: materials.data.bed })
  if (definition instanceof Error) return definition
  const blanket = definition.bed.linen?.find((piece) => piece.kind === "blanket"),
    slots = storage.data.filter((slot) => slot.resident === definition.place.resident && slot.packing?.front_access?.spare_blanket)
  if (!blanket || slots.length !== 1 || source.owner !== definition.place.resident || source.cloth_id !== `${slots[0].id}:blanket-cloth`)
    return new Error("Blanket cloth has no unique owner and spare")
  const spare = slots[0].packing?.front_access?.spare_blanket
  if (
    !spare ||
    spare.source_blanket !== blanket.id ||
    spare.id !== `${slots[0].id}:spare-blanket` ||
    new Set(source.cuts.map((cut) => cut.output)).size !== 2 ||
    ![blanket.id, spare.id].every((id) => source.cuts.some((cut) => cut.output === id))
  )
    return new Error("Blanket cutting duplicates or changes its outputs")
  const size = getHemmedTextileCutSize({ finished: [blanket.width, blanket.length], edgeAllowance: source.edge_allowance_m })
  if (size instanceof Error) return size
  const cuts = source.cuts.map((cut) => ({ id: cut.output, origin: cut.origin_m, size }))
  // A common auxiliary axis reduces the existing box test to planar overlap; it is not fabric thickness.
  const layout = getBoxLayoutError({
    size: [source.width_m, 1, source.length_m],
    boxes: cuts.map((cut) => ({ id: cut.id, origin: [cut.origin[0], 0, cut.origin[1]], size: [size[0], 1, size[1]] })),
    gap: source.gap_m,
  })
  if (layout) return layout
  if (
    cuts.some(
      (cut) => cut.origin[0] < source.gap_m || cut.origin[1] < source.gap_m || cut.origin[0] + size[0] > source.width_m - source.gap_m || cut.origin[1] + size[1] > source.length_m - source.gap_m,
    )
  )
    return new Error("Blanket cutting lacks outer cloth margins")

  return { source, cuts, textile: materials.data.textile }
}
