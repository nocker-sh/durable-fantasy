import { getTwoBoneBallRange } from "#/lib/engine/get-two-bone-ball-range"
type Props = Parameters<typeof getTwoBoneBallRange>[0] & Readonly<{ targetSpeed: number }>

/** Differentiate the same two-sphere joint construction over a bounded target path with a fixed root and pole. */
export function getTwoBoneBallSpeedBound(props: Props): number | Error {
  if (!Number.isFinite(props.targetSpeed) || props.targetSpeed < 0) return new Error("Invalid two-bone target speed")
  const range = getTwoBoneBallRange(props)
  if (range instanceof Error) return range
  const axis = props.targetSpeed / range.minimum,
    along = 0.5 * (1 + Math.abs(props.upper ** 2 - props.lower ** 2) / range.minimum ** 2) * props.targetSpeed
  const height = (range.alongMaximum * along) / range.heightMinimum,
    bend = (2 * range.poleLength * axis) / range.bendMinimum
  const speed = along + range.alongMaximum * axis + height + props.upper * bend
  if (!Number.isFinite(speed)) return new Error("Unbounded two-bone joint speed")

  return speed * (1 + 1e-12) + 1e-12
}
