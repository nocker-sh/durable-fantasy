import { getPillowCoverLayoutBoxes } from "#/scripts/lib/get-pillow-cover-layout-boxes"
import { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
import { getRoomBedDefinition } from "#/scripts/lib/get-room-bed-definition"
import { getSeamedBoxTextilePanels } from "#/world/town/get-seamed-box-textile-panels"
import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Both removable covers require all six faces of their owner's filled pillow, on a separate unrolled cloth. */
export function getPillowCoverCuttingReview(room: SettingDocument) {
  const materials = sleepingMaterialsSchema.safeParse(room.sleeping_materials)
  if (!materials.success || !materials.data.pillow_cover_cutting) return new Error("Missing pillow cover cutting proposal")
  const source = materials.data.pillow_cover_cutting,
    definition = getRoomBedDefinition({ room, bedId: materials.data.bed })
  if (definition instanceof Error) return definition
  const pillow = definition.bed.linen?.find((piece) => piece.kind === "pillow")
  if (!pillow || source.pillow !== pillow.id || source.owner !== definition.place.resident || source.cloth_id !== `${pillow.id}:cover-cloth`)
    return new Error("Pillow cover cloth and sleeping owner disagree")
  const panels = getSeamedBoxTextilePanels({ size: [pillow.width, pillow.thickness, pillow.length], seamAllowance: source.seam_allowance_m })
  if (panels instanceof Error) return panels
  const cuts = getPillowCoverLayoutBoxes({ pillowId: pillow.id, panels, cuts: source.cuts })
  if (cuts instanceof Error) return cuts
  const layout = getBoxLayoutError({ size: [source.width_m, 1, source.length_m], boxes: cuts, gap: source.gap_m })
  if (layout) return layout
  if (
    cuts.some(
      (cut) =>
        cut.origin[0] < source.gap_m || cut.origin[2] < source.gap_m || cut.origin[0] + cut.size[0] > source.width_m - source.gap_m || cut.origin[2] + cut.size[2] > source.length_m - source.gap_m,
    )
  )
    return new Error("Pillow cover cuts lack outer cloth margins")

  return { source, cuts, textile: materials.data.textile }
}
