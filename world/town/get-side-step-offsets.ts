import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = { phase: number; stride: number; lift: number; direction: "left" | "right" }
/** The leading foot steps out before the trailing foot collects; offsets compensate the body's translation to retain a planted foot. */
export function getSideStepOffsets(props: Props): { body: number; l: Point3; r: Point3 } | Error {
  if (
    ![props.phase, props.stride, props.lift].every(Number.isFinite) ||
    props.phase < 0 ||
    props.phase > 1 ||
    props.stride <= 0 ||
    props.lift <= 0 ||
    (props.direction !== "left" && props.direction !== "right")
  )
    return new Error("Invalid side-step dimensions")
  const lead = Math.min(1, props.phase * 2),
    trail = Math.max(0, props.phase * 2 - 1),
    sign = props.direction === "left" ? 1 : -1
  const offset = (progress: number): Point3 => [(progress * progress * (3 - 2 * progress) - props.phase) * props.stride * sign, 16 * progress ** 2 * (1 - progress) ** 2 * props.lift, 0]
  const leading = offset(lead),
    trailing = offset(trail)
  if (props.direction === "left") return { body: props.phase * props.stride, l: leading, r: trailing }
  return { body: -props.phase * props.stride, l: trailing, r: leading }
}
