import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
import { canClearSeatedArmInterval } from "#/world/scene/can-clear-seated-arm-interval"
import { twoBoneSegmentReach } from "#/lib/engine/two-bone-segment-reach"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
type Props = Parameters<typeof canClearSeatedArmInterval>[0]

/** Fail closed when reach or a continuous clearance enclosure cannot be proved at the subdivision limit. */
export function certifySeatedArmSegment(props: Props): ReturnType<typeof certifyLinearInterval> {
  if (![...props.from, ...props.to, ...props.pole].every(Number.isFinite)) return new Error("Invalid seated arm segment")
  const lengths = armGripLengths(props.skeleton, props.hand)
  if (!twoBoneSegmentReach({ root: props.skeleton.p[`upperarm_${props.hand}`], from: props.from, to: props.to, upper: lengths.upper, lower: lengths.forearm + lengths.palm }))
    return new Error("Seated arm segment is unreachable without stretching")
  const certified = certifyLinearInterval({ from: props.from, to: props.to, canClear: (from, to) => canClearSeatedArmInterval({ ...props, from, to }) })
  if (certified instanceof Error) return new Error("Seated arm continuous clearance remains unresolved", { cause: certified })

  return certified
}
