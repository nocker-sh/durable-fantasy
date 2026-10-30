import type { Vector2, Vector2Tuple } from "#/lib/engine/vector2-types"

type Props = Readonly<{ from: Vector2; to: Vector2; point: Vector2 }>

/** Clamp the projection to the segment; a repeated endpoint stays at that endpoint. */
export function getNearestSegmentPoint(props: Props): Vector2Tuple {
  const dx = props.to[0] - props.from[0]
  const dz = props.to[1] - props.from[1]
  const fraction = Math.max(0, Math.min(1, ((props.point[0] - props.from[0]) * dx + (props.point[1] - props.from[1]) * dz) / (dx * dx + dz * dz || 1)))
  return [props.from[0] + dx * fraction, props.from[1] + dz * fraction]
}
