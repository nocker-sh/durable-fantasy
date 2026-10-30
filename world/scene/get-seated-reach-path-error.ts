import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import { certifySeatedArmSegment } from "#/world/scene/certify-seated-arm-segment"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Omit<Parameters<typeof getSeatedNativePose>[0], "frame"> & { hand: "l" | "r"; from: Point3; to: Point3; pole: Point3; obstacles: readonly Cuboid[] }

/** Both world-space endpoints share the same frozen frame and pole, connecting adjacent authored stages. */
export function getSeatedReachPathError(props: Props): Error | null {
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const pose = getSeatedNativePose({ ...props, frame })
    if (pose instanceof Error) return pose
    const from = toHeadingLocalPoint(props.from, pose.root, props.place.heading),
      to = toHeadingLocalPoint(props.to, pose.root, props.place.heading)
    const certified = certifySeatedArmSegment({ ...props, ...pose, heading: props.place.heading, selfClearance: props.rest !== undefined, from, to })
    if (certified instanceof Error) return new Error(`frame ${frame}: ${certified.message}`, { cause: certified })
  }

  return null
}
