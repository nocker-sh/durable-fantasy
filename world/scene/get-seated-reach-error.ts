import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedReachPose } from "#/world/scene/get-seated-reach-pose"
import { getSeatedArmClearanceError } from "#/world/scene/get-seated-arm-clearance-error"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Omit<Parameters<typeof getSeatedReachPose>[0], "frame"> & { obstacles: readonly Cuboid[] }

/** Certify only the sampled ready poses above an object, not grasping or the path between poses. */
export function getSeatedReachError(props: Props): Error | null {
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const pose = getSeatedReachPose({ ...props, frame })
    if (pose instanceof Error) return new Error(`frame ${frame}: ${pose.message}`, { cause: pose })
    const error = getSeatedArmClearanceError({
      look: props.look,
      skeleton: pose.skeleton,
      root: pose.root,
      heading: props.place.heading,
      obstacles: props.obstacles,
      movingHand: null,
      margin: 0,
      selfClearance: props.rest !== undefined,
    })
    if (error) return new Error(`frame ${frame}: ${error.message}`, { cause: error })
  }

  return null
}
