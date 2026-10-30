import { quarterTurnPoint } from "#/lib/engine/quarter-turn-point"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
type Props = Readonly<{ bounds: Readonly<Rectangle>; turn: 0 | 1 | 2 | 3; origin?: readonly [number, number] }>

/** Rotate an axis-aligned rectangle about the origin by exact quarter turns. */
export function quarterTurnRect(props: Props): Rectangle {
  const first = quarterTurnPoint(props.bounds.x0, props.bounds.z0, props.turn)
  const second = quarterTurnPoint(props.bounds.x1, props.bounds.z1, props.turn)
  const x = props.origin?.[0] ?? 0
  const z = props.origin?.[1] ?? 0
  return { x0: x + Math.min(first[0], second[0]), z0: z + Math.min(first[1], second[1]), x1: x + Math.max(first[0], second[0]), z1: z + Math.max(first[1], second[1]) }
}
