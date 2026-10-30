import { getNorthHingedLidEnvelope } from "#/world/town/get-north-hinged-lid-envelope"
import { getCabinetRoomBoundsError } from "#/world/town/get-cabinet-room-bounds-error"
import { cuboidTranslationHits } from "../../lib/engine/cuboid-translation-hits"
import { getStorageSparePillowCoverDefinition } from "#/scripts/lib/get-storage-spare-pillow-cover-definition"
import { getCabinetTopPackagePlacement } from "#/world/town/get-cabinet-top-package-placement"
import type { getFrontAccessSpareBlanketPlacement } from "#/scripts/lib/get-front-access-spare-blanket-placement"
type Props = Parameters<typeof getFrontAccessSpareBlanketPlacement>[0]

/** Include the same proposed cover envelope in hardware, retrieval and body checks before cabinet assembly. */
export function getFrontAccessSparePillowCoverPlacement(props: Props) {
  if (!props.slot.packing?.front_access?.spare_pillow_cover) return null
  const definition = getStorageSparePillowCoverDefinition(props)
  if (definition instanceof Error) return definition
  const box = getCabinetTopPackagePlacement({
    id: definition.source.id,
    origin: definition.source.position_m,
    size: definition.size,
    bounds: props.spec.bounds,
    section: props.section,
    clearance: props.slot.packing?.clearance_m ?? 0,
  })
  if (box instanceof Error) return box

  const lidSweep = getNorthHingedLidEnvelope({ box: { x0: box.x0, x1: box.x1, z0: box.z0, z1: box.z1, y0: box.bottom, y1: box.top }, lid: definition.source.container.lid_m })
  if (lidSweep instanceof Error) return lidSweep
  const bounds = getCabinetRoomBoundsError({ parts: [lidSweep], section: props.section })
  if (bounds) return bounds
  if (props.section.obstacles.some((obstacle) => cuboidTranslationHits({ relative: lidSweep, from: [0, 0, 0], to: [0, 0, 0], obstacle: obstacle })))
    return new Error("Pillow cover lid sweep intersects the room")

  return { ...definition, box, lidSweep }
}
