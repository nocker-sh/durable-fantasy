import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedWithdrawalFrame } from "#/world/scene/get-seated-withdrawal-frame"
import { certifySeatedElbowSwivel } from "#/world/scene/certify-seated-elbow-swivel"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Omit<Parameters<typeof getSeatedWithdrawalFrame>[0], "frame"> & { poleTarget: Point3; obstacles: readonly Cuboid[] }

/** Keep the withdrawal endpoint fixed and continuously switch to the authored preparation pole. */
export function getSeatedElbowSwivelError(props: Props): Error | null {
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const pose = getSeatedWithdrawalFrame({ ...props, frame })
    if (pose instanceof Error) return pose
    const certified = certifySeatedElbowSwivel({ ...props, ...pose, heading: props.place.heading, selfClearance: props.rest !== undefined, from: pose.pole, to: props.poleTarget })
    if (certified instanceof Error) return new Error(`frame ${frame}: ${certified.message}`, { cause: certified })
  }

  return null
}
