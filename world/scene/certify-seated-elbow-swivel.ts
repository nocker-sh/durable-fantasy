import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
import { twoBoneSegmentReach } from "#/lib/engine/two-bone-segment-reach"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { canClearSeatedArmPoleInterval } from "#/world/scene/can-clear-seated-arm-pole-interval"
type Props = Parameters<typeof canClearSeatedArmPoleInterval>[0]

/** Preserve the same palm point and reject any unresolved bend-plane singularity or continuous collision. */
export function certifySeatedElbowSwivel(props: Props): ReturnType<typeof certifyLinearInterval> {
  if (![...props.target, ...props.from, ...props.to].every(Number.isFinite)) return new Error("Invalid seated elbow swivel")
  const lengths = armGripLengths(props.skeleton, props.hand)
  if (!twoBoneSegmentReach({ root: props.skeleton.p[`upperarm_${props.hand}`], from: props.target, to: props.target, upper: lengths.upper, lower: lengths.forearm + lengths.palm }))
    return new Error("Seated elbow swivel target is unreachable")
  const certified = certifyLinearInterval({ from: props.from, to: props.to, canClear: (from, to) => canClearSeatedArmPoleInterval({ ...props, from, to }) })
  if (certified instanceof Error) return new Error("Seated elbow swivel continuous clearance remains unresolved", { cause: certified })

  return certified
}
