import { getNativeSideStepKinematicSlice } from "#/world/scene/figure/get-native-side-step-kinematic-slice"
import { getNativeStandingLegTopologyError } from "#/world/scene/figure/get-native-standing-leg-topology-error"
import { getNativeLegIntervalExternalError } from "#/world/scene/figure/get-native-leg-interval-external-error"
import { createBodyContext } from "#/world/scene/figure/context"
import { buildLegs } from "#/world/scene/figure/legs"
import type { getNativeSideStepLegExternalContext } from "#/world/scene/figure/get-native-side-step-leg-external-context"
type Props = Readonly<{ context: Exclude<ReturnType<typeof getNativeSideStepLegExternalContext>, Error>; from: number; to: number }>

/** Enclose every actual standing leg part with its control-point speed; a possible recipe change or an unresolved capsule rejects the slice. */
export function getNativeSideStepLegExternalSlice(props: Props) {
  const c = props.context,
    slice = getNativeSideStepKinematicSlice(props)
  if (slice instanceof Error) return slice
  const topology = getNativeStandingLegTopologyError({ look: c.look, skeleton: slice.pose.skeleton, kneeMargins: slice.kneeMargins })
  if (topology) return topology
  const legs = buildLegs(createBodyContext(c.look, slice.pose.skeleton, null)),
    error = getNativeLegIntervalExternalError({ legs, margins: slice.legMargins, rootY: c.rootY, ceiling: c.ceiling, boxes: c.boxes })
  if (error) return error

  return { from: props.from, to: props.to, margins: slice.legMargins }
}
