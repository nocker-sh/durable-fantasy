import { nativeArmMotionSpeed } from "#/world/scene/figure/native-arm-motion-speed"
type Props = { lengths: Readonly<{ forearm: number; palm: number }>; scale: number; elbow: number; grip: number }

/** Bound the wrist, turning forearm and uncut skin with the same native control-point coefficients as rendering. */
export function getNativeArmMotionBound(props: Props) {
  if (
    ![props.lengths.forearm, props.lengths.palm, props.scale].every((value) => Number.isFinite(value) && value > 0) ||
    ![props.elbow, props.grip].every((value) => Number.isFinite(value) && value >= 0)
  )
    return new Error("Unbounded arm grip motion")
  const length = props.lengths.forearm + props.lengths.palm
  const wrist = (props.lengths.palm * props.elbow + props.lengths.forearm * props.grip) / length,
    direction = (props.grip + props.elbow) / length
  const surface = nativeArmMotionSpeed({ scale: props.scale, forearm: props.lengths.forearm, palm: props.lengths.palm, elbowSpeed: props.elbow, gripSpeed: props.grip })
  if (![wrist, direction, surface].every(Number.isFinite)) return new Error("Unbounded arm grip motion")

  return { elbow: props.elbow, grip: props.grip, wrist, direction, surface, scale: props.scale }
}
