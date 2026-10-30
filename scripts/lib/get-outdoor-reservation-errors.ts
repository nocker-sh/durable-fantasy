import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
type Rect = readonly [number, number, number, number]
type Props = Readonly<{
  bounds: Rect
  mapTiles: number
  obstacles: ReadonlyArray<Readonly<{ id: string; rect: Rect }>>
  corridors: ReadonlyArray<Readonly<{ id: string; points: ReadonlyArray<readonly [number, number]>; halfWidth: number }>>
}>

/** A waiting area must preserve buildings, productive land, full road widths and water, even when their centre lines miss it. */
export function getOutdoorReservationErrors(props: Props): readonly string[] {
  const bounds = props.bounds,
    errors: string[] = []
  if (![...bounds, props.mapTiles].every(Number.isFinite) || props.mapTiles <= 0 || bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) return ["Invalid outdoor reservation"]
  if (bounds[0] < 0 || bounds[1] < 0 || bounds[2] > props.mapTiles || bounds[3] > props.mapTiles) errors.push("Outdoor reservation leaves its map")
  for (const obstacle of props.obstacles) {
    const rect = obstacle.rect
    if (!rect.every(Number.isFinite) || rect[0] >= rect[2] || rect[1] >= rect[3]) {
      errors.push(`Invalid reservation obstacle ${obstacle.id}`)
      continue
    }
    if (bounds[0] < rect[2] && rect[0] < bounds[2] && bounds[1] < rect[3] && rect[1] < bounds[3]) errors.push(`Outdoor reservation overlaps ${obstacle.id}`)
  }
  for (const corridor of props.corridors) {
    if (!Number.isFinite(corridor.halfWidth) || corridor.halfWidth < 0 || corridor.points.length < 2 || corridor.points.some((point) => !point.every(Number.isFinite))) {
      errors.push(`Invalid reservation corridor ${corridor.id}`)
      continue
    }
    for (const index of corridor.points.keys())
      if (index > 0 && segmentRectDistance(bounds, corridor.points[index - 1], corridor.points[index]) < corridor.halfWidth) {
        errors.push(`Outdoor reservation covers ${corridor.id}`)
        break
      }
  }

  return errors
}
