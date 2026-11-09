import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Readonly<{ skeleton: Skel; side: "l" | "r"; offset: Point3; clearance: number }>

/** The reach certificate and actual leg solver share the same shoe target, including the native shoe's initial float. */
export function getNativeGroundedFootTarget(props: Props): Point3 | Error {
  const foot = props.skeleton.p[`foot_${props.side}`]
  if (![...foot, ...props.offset, props.clearance].every(Number.isFinite) || props.clearance < 0 || props.offset[1] < 0) return new Error("Invalid grounded native foot target")
  const target: Point3 = [foot[0] + props.offset[0], foot[1] + props.offset[1] - props.clearance, foot[2] + props.offset[2]]
  if (!target.every(Number.isFinite)) return new Error("Unbounded grounded native foot target")

  return target
}
