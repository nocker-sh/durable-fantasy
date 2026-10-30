import type { Vector3 } from "#/lib/engine/vector3-types"
type Props = Readonly<{ upper: number; lower: number; velocity: number; poleOffset: Vector3; distance: Readonly<{ min: number; max: number }>; bendMinimum: number }>

/** Preserve the conservative speed allowance and leave a fully extended joint unresolved. */
export function getTwoBoneJointSpeedLimit(props: Props): number | undefined {
  const difference = props.upper * props.upper - props.lower * props.lower
  const along = (distance: number) => (distance * distance + difference) / (2 * distance)
  const alongMaximum = Math.max(Math.abs(along(props.distance.min)), Math.abs(along(props.distance.max)))
  const heightMinimum = Math.sqrt(Math.max(0, props.upper * props.upper - alongMaximum * alongMaximum))
  if (heightMinimum === 0) return undefined
  const axisSpeed = props.velocity / props.distance.min
  const alongSpeed = 0.5 * (1 + Math.abs(difference) / (props.distance.min * props.distance.min)) * props.velocity
  const heightSpeed = (alongMaximum * alongSpeed) / heightMinimum
  const bendSpeed = (2 * Math.hypot(...props.poleOffset) * axisSpeed) / props.bendMinimum
  const speed = alongSpeed + alongMaximum * axisSpeed + heightSpeed + props.upper * bendSpeed
  return Number.isFinite(speed) ? speed * (1 + 1e-12) + 1e-12 : undefined
}
