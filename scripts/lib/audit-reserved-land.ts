import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import type { ReservedLand } from "#/scripts/lib/land-use"

/** Occupied ground cannot be erased by enlarging a house or drawing its access path. */
type Props = {
  id: string
  bounds: readonly number[] | undefined
  paths: readonly { points_tiles: readonly (readonly number[])[]; width_m: number }[]
  areas: readonly ReservedLand[]
  metres: number
}

export function auditReservedLand(props: Props): string[] {
  const errors: string[] = []
  for (const area of props.areas) {
    if (area.id === props.id || area.id.startsWith(`${props.id}/`)) continue
    const r = area.rect
    if (props.bounds && props.bounds[0] < r[2] && r[0] < props.bounds[2] && props.bounds[1] < r[3] && r[1] < props.bounds[3]) errors.push(`Footprint covers reserved land ${area.id}`)
    if (props.paths.some((path) => path.points_tiles.slice(1).some((p, i) => segmentRectDistance(r, path.points_tiles[i], p) < path.width_m / props.metres / 2)))
      errors.push(`Access crosses reserved land ${area.id}`)
  }
  return errors
}
