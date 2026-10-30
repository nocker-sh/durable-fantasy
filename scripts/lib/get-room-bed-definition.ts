import { measuredSleepingPlaceSchema } from "#/scripts/lib/sleeping-materials-schema"
import { bedDimensions } from "#/scripts/lib/bed-dimensions"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = { room: SettingDocument; bedId: string }

/** Resolve an individual's assigned physical bed rather than guessing a bed from the room's name. */
export function getRoomBedDefinition(props: Props) {
  const places = measuredSleepingPlaceSchema.safeParse(props.room.sleeping_places)
  if (!places.success || !props.room.grid) return new Error("Measured bed has no assigned sleeping place")
  const matches = places.data.filter((candidate) => candidate.id === props.bedId)
  if (matches.length !== 1) return new Error("Measured bed assignment is missing or ambiguous")
  const place = matches[0],
    furniture = props.room.furniture?.find((piece) => piece.symbol === place?.grid_symbol)
  if (!place || furniture?.role !== "bed" || furniture.runtime_kind !== "bed" || furniture.runtime_solid !== true) return new Error("Sleeping place has no explicit solid bed")
  const width = furniture.rect[2] * props.room.grid.cell_m,
    depth = furniture.rect[3] * props.room.grid.cell_m
  try {
    const bed = bedDimensions(furniture.bed, width, depth)
    return { place, furniture, width, depth, bed }
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid room bed construction")
  }
}
