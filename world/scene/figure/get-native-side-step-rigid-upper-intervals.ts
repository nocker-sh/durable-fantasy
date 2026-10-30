import { getNativeSideStepLegExternalContext } from "#/world/scene/figure/get-native-side-step-leg-external-context"
import { getNativeSideStepKinematicSlice } from "#/world/scene/figure/get-native-side-step-kinematic-slice"
import { getNativeRigidUpperTopologyError } from "#/world/scene/figure/get-native-rigid-upper-topology-error"
import { getNativeRigidUpperExternalError } from "#/world/scene/figure/get-native-rigid-upper-external-error"
import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
import { getNativeRigidUpperReferenceError } from "#/world/scene/figure/get-native-rigid-upper-reference-error"
type Props = Omit<Parameters<typeof getNativeSideStepLegExternalContext>[0], "boxes"> &
  Omit<Parameters<typeof getNativeRigidUpperExternalError>[0], "look" | "rootY" | "ceiling"> &
  Pick<Parameters<typeof getNativeRigidUpperReferenceError>[0], "pole">

/** The bar-relative arm pose is fixed by construction; prove every skirt/tail remains standing before applying one rigid shape to the entire swept room. */
export function getNativeSideStepRigidUpperIntervals(props: Props) {
  const context = getNativeSideStepLegExternalContext({ ...props, boxes: [] })
  if (context instanceof Error) return context
  const reference = getNativeRigidUpperReferenceError(props)
  if (reference) return reference
  const topology = getNativeRigidUpperTopologyError({ look: props.look, skeleton: props.reference, kneeMargins: { l: 0, r: 0 } })
  if (topology) return topology
  const fixed = getNativeRigidUpperExternalError({ ...props, rootY: context.rootY })
  if (fixed) return fixed
  const review = certifyLinearInterval({
    from: [0, 0, 0],
    to: [1, 0, 0],
    canClear: (from, to) => {
      const slice = getNativeSideStepKinematicSlice({ context, from: from[0], to: to[0] })
      if (slice instanceof Error) return false
      return !getNativeRigidUpperTopologyError({ look: props.look, skeleton: slice.pose.skeleton, kneeMargins: slice.kneeMargins })
    },
  })
  if (review instanceof Error) return new Error("Native rigid upper shape interval remains unresolved", { cause: review })

  return review.intervals.map((interval) => ({ from: interval.from[0], to: interval.to[0] }))
}
