import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
import { getNativeStepLegChain } from "#/world/scene/figure/get-native-step-leg-chain"
import { getNativeSideStepLegSlice } from "#/world/scene/figure/get-native-side-step-leg-slice"
type Props = Omit<Parameters<typeof getNativeStepLegChain>[0], "side"> & Omit<Parameters<typeof getNativeSideStepLegSlice>[0], "chain" | "from" | "to" | "phase">
type Slice = Exclude<ReturnType<typeof getNativeSideStepLegSlice>, Error> & Readonly<{ side: "l" | "r" }>

/** Both actual leg targets require complete ordered interval coverage; unresolved reach, singular poles or a precision limit reject the entire cycle. */
export function getNativeSideStepLegIntervals(props: Props): readonly Slice[] | Error {
  const slices: Slice[] = []

  for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
    const chain = getNativeStepLegChain({ ...props, side })
    if (chain instanceof Error) return chain
    const review = certifyLinearInterval({ from: [0, 0, 0], to: [1, 0, 0], canClear: (from, to) => !(getNativeSideStepLegSlice({ ...props, chain, from: from[0], to: to[0] }) instanceof Error) })
    if (review instanceof Error) return new Error("Native side-step leg reach remains unresolved", { cause: review })
    for (const interval of review.intervals) {
      const slice = getNativeSideStepLegSlice({ ...props, chain, from: interval.from[0], to: interval.to[0] })
      if (slice instanceof Error) return slice
      slices.push({ ...slice, side })
    }
  }

  return slices
}
