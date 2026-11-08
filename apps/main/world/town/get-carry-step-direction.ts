import { quarterTurnPoint } from "#/lib/engine/quarter-turn-point"
type Props = { from: readonly [number, number]; to: readonly [number, number]; turn: number }
export type CarryStepDirection = "forward" | "backward" | "side_left" | "side_right"
/** Left and right belong to the carrier, not the screen; diagonal steps need their own authored gait. */
export function getCarryStepDirection(props: Props): CarryStepDirection | Error {
  if (![...props.from, ...props.to].every(Number.isFinite) || (props.turn !== 0 && props.turn !== 1 && props.turn !== 2 && props.turn !== 3)) return new Error("Invalid carry step geometry")
  const left = quarterTurnPoint(1, 0, props.turn),
    forward = quarterTurnPoint(0, 1, props.turn)
  const dx = props.to[0] - props.from[0],
    dz = props.to[1] - props.from[1],
    x = dx * left[0] + dz * left[1],
    z = dx * forward[0] + dz * forward[1]
  if (Math.abs(x) <= 1e-9 && Math.abs(z) <= 1e-9) return new Error("Carry step has no movement")
  if (Math.abs(x) > 1e-9 && Math.abs(z) > 1e-9) return new Error("Diagonal carry step needs an authored gait")
  if (x > 1e-9) return "side_left"
  if (x < -1e-9) return "side_right"
  if (z > 0) return "forward"
  return "backward"
}
