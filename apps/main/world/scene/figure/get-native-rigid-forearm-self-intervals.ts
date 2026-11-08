import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
import { getNativeSideStepLegExternalContext } from "#/world/scene/figure/get-native-side-step-leg-external-context"
import { getNativeRigidUpperReferenceError } from "#/world/scene/figure/get-native-rigid-upper-reference-error"
import { getNativeRigidForearmSelfSlice } from "#/world/scene/figure/get-native-rigid-forearm-self-slice"
type Props = Omit<Parameters<typeof getNativeSideStepLegExternalContext>[0], "boxes"> & Parameters<typeof getNativeRigidUpperReferenceError>[0]

/** No interval is discarded when knees, garment topology or self-clearance cannot be proved. */
export function getNativeRigidForearmSelfIntervals(props: Props) {
  const reference = getNativeRigidUpperReferenceError(props)
  if (reference) return reference
  const context = getNativeSideStepLegExternalContext({ ...props, boxes: [] })
  if (context instanceof Error) return context
  const review = certifyLinearInterval({
    from: [0, 0, 0],
    to: [1, 0, 0],
    canClear: (from, to) => !getNativeRigidForearmSelfSlice({ context, reference: props.reference, hand: props.hand, from: from[0], to: to[0] }),
  })
  if (review instanceof Error) return new Error("Native forearm self-clearance interval remains unresolved", { cause: review })

  return review.intervals.map((interval) => ({ from: interval.from[0], to: interval.to[0] }))
}
