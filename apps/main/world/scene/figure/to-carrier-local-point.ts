import { quarterTurnPoint } from "#/lib/engine/quarter-turn-point"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { point: Point3; body: readonly [number, number]; rootY: number; turn: 0 | 1 | 2 | 3 }
const inverseTurns: Record<0 | 1 | 2 | 3, 0 | 1 | 2 | 3> = { 0: 0, 1: 3, 2: 2, 3: 1 }
/** Use the carrier's grounded origin, preserving the shared world heights. */
export function toCarrierLocalPoint(props: Props): Point3 {
  const horizontal = quarterTurnPoint(props.point[0] - props.body[0], props.point[2] - props.body[1], inverseTurns[props.turn])
  return [horizontal[0], props.point[1] - props.rootY, horizontal[1]]
}
