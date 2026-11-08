import { getNativeSideStepKinematicSlice } from "#/world/scene/figure/get-native-side-step-kinematic-slice"
import { getNativeRigidUpperTopologyError } from "#/world/scene/figure/get-native-rigid-upper-topology-error"
import { withNativeLegPose } from "#/world/scene/figure/with-native-leg-pose"
import { getForearmSelfClearanceError } from "#/world/scene/figure/get-forearm-self-clearance-error"
import type { Skel } from "#/world/scene/rig"
type Props = Parameters<typeof getNativeSideStepKinematicSlice>[0] & Readonly<{ reference: Skel; hand: "l" | "r" }>

/** Uncut fixed forearm/cuff surfaces must clear all other body parts, including the complete moving-leg envelope. */
export function getNativeRigidForearmSelfSlice(props: Props): Error | null {
  const slice = getNativeSideStepKinematicSlice(props)
  if (slice instanceof Error) return slice
  const topology = getNativeRigidUpperTopologyError({ look: props.context.look, skeleton: slice.pose.skeleton, kneeMargins: slice.kneeMargins })
  if (topology) return topology
  const skeleton = withNativeLegPose({ upper: props.reference, legs: slice.pose.skeleton })
  if (skeleton instanceof Error) return skeleton

  return getForearmSelfClearanceError({ look: props.context.look, skeleton, hand: props.hand, margin: Math.max(slice.legMargins.l, slice.legMargins.r) })
}
