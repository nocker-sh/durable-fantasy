import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { getForearmSelfClearanceError } from "#/world/scene/figure/get-forearm-self-clearance-error"
import { getSeatedArmClearanceError } from "#/world/scene/get-seated-arm-clearance-error"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Omit<Parameters<typeof getSeatedNativePose>[0], "frame"> & { obstacles: readonly Cuboid[] }
const hands: readonly ("l" | "r")[] = ["l", "r"]

/** Resting hands must clear both the diner and the same table before any preparation path begins. */
export function getSeatedRestError(props: Props): Error | null {
  if (!props.rest) return null
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const pose = getSeatedNativePose({ ...props, frame })
    if (pose instanceof Error) return pose
    const external = getSeatedArmClearanceError({ ...props, ...pose, heading: props.place.heading, movingHand: null, margin: 0 })
    if (external) return new Error(`Rest frame ${frame}: ${external.message}`, { cause: external })
    for (const hand of hands) {
      const self = getForearmSelfClearanceError({ look: props.look, skeleton: pose.skeleton, hand, margin: 0 })
      if (self) return new Error(`Rest frame ${frame}: ${self.message}`, { cause: self })
    }
  }

  return null
}
