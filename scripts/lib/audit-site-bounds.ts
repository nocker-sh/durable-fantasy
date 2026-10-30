import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Rect, ExistingHouse } from "#/scripts/lib/building-site"

/** Both walls and roof overhangs use the same rectangle and road-width rules. */
type Props = {
  bounds: Rect
  building: SettingDocument
  houses: readonly ExistingHouse[]
  roads: readonly { pts: readonly (readonly number[])[]; w: number }[]
  mapTiles: number
  label?: string
}

export function auditSiteBounds(props: Props): string[] {
  const label = props.label === undefined ? "Outdoor footprint" : props.label

  const problems: string[] = []
  if (props.bounds[0] < 0 || props.bounds[1] < 0 || props.bounds[2] > props.mapTiles || props.bounds[3] > props.mapTiles) problems.push(`${label} leaves its map`)
  for (const house of props.houses)
    if (
      `building-${house.id}` !== props.building.id &&
      `map-${house.map}` === props.building.map &&
      props.bounds[0] < house.x1 &&
      house.x0 < props.bounds[2] &&
      props.bounds[1] < house.z1 &&
      house.z0 < props.bounds[3]
    )
      problems.push(`${label} overlaps building-${house.id}`)
  for (const entry of props.roads.entries()) {
    const index = entry[0]
    const road = entry[1]
    for (const i = { value: 1 }; i.value < road.pts.length; i.value++)
      if (segmentRectDistance(props.bounds, road.pts[i.value - 1], road.pts[i.value]) < road.w) {
        problems.push(`${label} covers road ${index + 1}`)
        break
      }
  }
  return problems
}
