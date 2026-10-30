import { quarterTurnPoint } from "#/lib/engine/quarter-turn-point"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { point: Point3; body: readonly [number, number]; rootY: number; turn: 0 | 1 | 2 | 3 }
/** Shared grounded origin keeps the carrier's local limb geometry aligned with the room. */
export function toCarrierWorldPoint(props: Props): Point3 {
  const horizontal = quarterTurnPoint(props.point[0], props.point[2], props.turn)
  return [horizontal[0] + props.body[0], props.point[1] + props.rootY, horizontal[1] + props.body[1]]
}
