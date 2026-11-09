import { NATIVE_ARM_SHAPE } from "#/world/scene/figure/arm-shape"

type Props = {
  scale: number
  forearm: number
  palm: number
  elbowSpeed: number
  gripSpeed: number
}

/** Each control point is (1-k)*elbow + k*grip; shoulder is fixed. */
export function nativeArmMotionSpeed(props: Props) {
  const length = props.forearm + props.palm,
    coefficients = [0, props.forearm / length, ...NATIVE_ARM_SHAPE.palm.map((c) => (props.forearm + c * props.scale) / length), ...NATIVE_ARM_SHAPE.cuff.map((c) => (c * props.forearm) / length)]
  return Math.max(...coefficients.map((k) => Math.abs(1 - k) * props.elbowSpeed + Math.abs(k) * props.gripSpeed))
}
