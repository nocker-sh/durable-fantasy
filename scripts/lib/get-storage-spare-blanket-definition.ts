import { sleepingMaterialsSchema, measuredSleepingPlaceSchema } from "#/scripts/lib/sleeping-materials-schema"
import { bedDimensionsSchema } from "#/scripts/lib/bed-dimensions-schema"
import { getFoldedTextileSize } from "#/world/town/get-folded-textile-size"
import type { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
type Props = Parameters<typeof getFrontAccessHandlePlan>[0]

/** A distinct spare inherits only its owner's authored blanket dimensions and textile supply; the in-use blanket stays on its bed. */
export function getStorageSpareBlanketDefinition(props: Props) {
  const source = props.slot.packing?.front_access?.spare_blanket,
    materials = sleepingMaterialsSchema.safeParse(props.room.sleeping_materials),
    places = measuredSleepingPlaceSchema.safeParse(props.room.sleeping_places)
  if (
    !source ||
    !materials.success ||
    !places.success ||
    source.id !== `${props.slot.id}:spare-blanket` ||
    source.source_blanket !== `${materials.data.bed}:blanket` ||
    source.id === source.source_blanket
  )
    return new Error("Missing distinct spare blanket of the storage owner")
  const place = places.data.find((candidate) => candidate.id === materials.data.bed && candidate.resident === props.slot.resident)
  if (!place) return new Error("Spare blanket belongs to another sleeper")
  const bed = bedDimensionsSchema.safeParse(props.room.furniture?.find((piece) => piece.symbol === place.grid_symbol)?.bed)
  if (!bed.success) return new Error("Spare blanket has no measured bed")
  const blanket = bed.data.linen?.find((piece) => piece.id === source.source_blanket && piece.kind === "blanket")
  if (!blanket) return new Error("Spare blanket has no matching in-use dimensions")
  const size = getFoldedTextileSize({ size: [blanket.width_m, blanket.thickness_m, blanket.length_m], folds: source.folds, allowance: source.allowance_m })
  if (size instanceof Error) return size

  return { source, size, textile: materials.data.textile }
}
