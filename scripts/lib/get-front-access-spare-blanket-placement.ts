import { getStorageSpareBlanketDefinition } from "#/scripts/lib/get-storage-spare-blanket-definition"
import { getCabinetTopPackagePlacement } from "#/world/town/get-cabinet-top-package-placement"
import type { getFrontAccessStorageReview } from "#/scripts/lib/get-front-access-storage-review"
import type { getRoomStorageSection } from "#/scripts/lib/get-room-storage-section"
import type { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
type Props = Parameters<typeof getFrontAccessHandlePlan>[0] &
  Readonly<{ spec: Exclude<ReturnType<typeof getFrontAccessStorageReview>, Error>["spec"]; section: Exclude<ReturnType<typeof getRoomStorageSection>, Error> }>

/** Resolve optional top storage before body and hardware checks, without calling back into cabinet assembly. */
export function getFrontAccessSpareBlanketPlacement(props: Props) {
  if (!props.slot.packing?.front_access?.spare_blanket) return null
  const definition = getStorageSpareBlanketDefinition(props)
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

  return { ...definition, box }
}
