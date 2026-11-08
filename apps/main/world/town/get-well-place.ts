import { WELL_PLACE_OFFSETS_TILES } from "#/world/town/well-dimensions"

/** Keep named scene standing points and setting reviews on the same native coordinates. */
export function getWellPlace(centre: readonly [number, number], place: keyof typeof WELL_PLACE_OFFSETS_TILES): [number, number] {
  const offset = WELL_PLACE_OFFSETS_TILES[place]

  return [centre[0] + offset[0], centre[1] + offset[1]]
}
