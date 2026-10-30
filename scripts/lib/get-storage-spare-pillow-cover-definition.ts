import { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
import { getCoveredTextileBox } from "#/world/town/get-covered-textile-box"
import { getPillowCoverCuttingReview } from "#/scripts/lib/get-pillow-cover-cutting-review"
import type { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
type Props = Parameters<typeof getFrontAccessHandlePlan>[0]

/** A declared package must contain only this owner's spare cover; cloth volume is a necessary bound, never proof of a fold. */
export function getStorageSparePillowCoverDefinition(props: Props) {
  const source = props.slot.packing?.front_access?.spare_pillow_cover,
    cutting = getPillowCoverCuttingReview(props.room)
  if (!source || cutting instanceof Error) return new Error("Missing measured spare pillow cover")
  if (
    source.id !== `${cutting.source.pillow}:spare-cover` ||
    source.source_pillow !== cutting.source.pillow ||
    source.source_cloth !== cutting.source.cloth_id ||
    props.slot.resident !== cutting.source.owner
  )
    return new Error("Spare pillow cover belongs to another cloth or owner")
  const panels = cutting.cuts.filter((cut) => cut.id.startsWith(`${source.id}:`))
  if (panels.length !== 6) return new Error("Spare pillow cover lacks six allocated panels")
  const clothVolume = panels.reduce((volume, panel) => volume + panel.size[0] * panel.size[2] * cutting.source.cloth_thickness_m, 0),
    envelopeVolume = source.size_m.reduce((volume, length) => volume * length, 1)
  if (!Number.isFinite(clothVolume) || clothVolume <= 0 || !Number.isFinite(envelopeVolume) || envelopeVolume <= 0 || clothVolume > envelopeVolume)
    return new Error("Spare pillow cover envelope loses cloth volume")

  const materials = sleepingMaterialsSchema.safeParse(props.room.sleeping_materials),
    box = source.container
  if (!materials.success || box.id !== `${source.id}:box` || box.maker !== materials.data.frame.maker || box.timber_supplier !== materials.data.frame.timber_supplier)
    return new Error("Pillow cover case lacks its owner’s wood suppliers")
  const container = getCoveredTextileBox({ size: box.size_m, packageSize: source.size_m, wall: box.wall_m, lid: box.lid_m, clearance: box.clearance_m })
  if (container instanceof Error) return container

  return { source, size: box.size_m, clothVolume, textile: cutting.textile, container }
}
