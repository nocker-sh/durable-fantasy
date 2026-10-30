import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import { certifySeatedElbowSwivel } from "#/world/scene/certify-seated-elbow-swivel"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Omit<Parameters<typeof getSeatedNativePose>[0], "frame"> & { hand: "l" | "r"; target: Point3; fromPole: Point3; toPole: Point3; obstacles: readonly Cuboid[] }

/** Hold the shared world-space palm point while changing the bend plane between authored motion stages. */
export function getSeatedPolePathError(props: Props): Error | null {
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const pose = getSeatedNativePose({ ...props, frame })
    if (pose instanceof Error) return pose
    const target = toHeadingLocalPoint(props.target, pose.root, props.place.heading)
    const certified = certifySeatedElbowSwivel({ ...props, ...pose, target, from: props.fromPole, to: props.toPole, heading: props.place.heading, selfClearance: props.rest !== undefined })
    if (certified instanceof Error) return new Error(`frame ${frame}: ${certified.message}`, { cause: certified })
  }

  return null
}
