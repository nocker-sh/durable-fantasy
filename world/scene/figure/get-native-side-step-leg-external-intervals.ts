import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
import { getNativeSideStepLegExternalContext } from "#/world/scene/figure/get-native-side-step-leg-external-context"
import { getNativeSideStepLegExternalSlice } from "#/world/scene/figure/get-native-side-step-leg-external-slice"
type Props = Parameters<typeof getNativeSideStepLegExternalContext>[0]

/** Complete interval coverage follows a whole-cycle shoe envelope; no unresolved leg region or precision failure is discarded. */
export function getNativeSideStepLegExternalIntervals(props: Props) {
  const context = getNativeSideStepLegExternalContext(props)
  if (context instanceof Error) return context
  const review = certifyLinearInterval({ from: [0, 0, 0], to: [1, 0, 0], canClear: (from, to) => !(getNativeSideStepLegExternalSlice({ context, from: from[0], to: to[0] }) instanceof Error) })
  if (review instanceof Error) return new Error("Native leg external interval remains unresolved", { cause: review })

  return review.intervals.map((interval) => ({ from: interval.from[0], to: interval.to[0] }))
}
