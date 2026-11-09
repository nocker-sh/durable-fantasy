import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedWithdrawalFrame } from "#/world/scene/get-seated-withdrawal-frame"
import { certifySeatedArmSegment } from "#/world/scene/certify-seated-arm-segment"
import { getSeatedArmClearanceError } from "#/world/scene/get-seated-arm-clearance-error"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Omit<Parameters<typeof getSeatedWithdrawalFrame>[0], "frame"> & { obstacles: readonly Cuboid[] }

/** Freeze each native frame while withdrawing; the next stage reuses exactly the same endpoint state. */
export function getSeatedWithdrawalError(props: Props): Error | null {
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const pose = getSeatedWithdrawalFrame({ ...props, frame })
    if (pose instanceof Error) return pose
    const initial = getSeatedArmClearanceError({ ...props, ...pose, heading: props.place.heading, selfClearance: props.rest !== undefined, movingHand: null, margin: 0 })
    if (initial) return initial
    const certified = certifySeatedArmSegment({ ...props, ...pose, heading: props.place.heading, selfClearance: props.rest !== undefined, from: pose.source, to: pose.target })
    if (certified instanceof Error) return new Error(`frame ${frame}: ${certified.message}`, { cause: certified })
  }

  return null
}
