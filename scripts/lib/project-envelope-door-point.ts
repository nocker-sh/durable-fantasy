import type { SpatialFrame } from "#/lib/engine/spatial-frame"

type Props = Readonly<{ frame: SpatialFrame; origin: readonly [number, number]; cellM: number; point: readonly [number, number]; metresPerTile: number }>

/** Room origins use cells; the door point uses room-local metres. Convert both once before the shared frame. */
export function projectEnvelopeDoorPoint(props: Props): readonly [number, number] {
  if (!Number.isFinite(props.metresPerTile) || props.metresPerTile <= 0) throw new RangeError("Invalid door metre-to-tile scale")
  const point = props.frame.toWorld([(props.origin[0] * props.cellM + props.point[0]) / props.metresPerTile, 0, (props.origin[1] * props.cellM + props.point[1]) / props.metresPerTile])
  return [point[0], point[2]]
}
