import { getNativeStepLegChain } from "#/world/scene/figure/get-native-step-leg-chain"
import { getNativeEasedShoeEnvelopes } from "#/world/scene/figure/get-native-eased-shoe-envelopes"
import { getNativeShoeEnvelopeError } from "#/world/scene/figure/get-native-shoe-envelope-error"
import type { getEasedSideStepOffsets } from "#/world/town/get-eased-side-step-offsets"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Omit<Parameters<typeof getNativeStepLegChain>[0], "side"> & Omit<Parameters<typeof getEasedSideStepOffsets>[0], "phase"> & Readonly<{ boxes: readonly Cuboid[]; ceiling: number }>

/** Cache the exact native chains and a whole-cycle shoe certificate before refining the remaining leg surfaces. */
export function getNativeSideStepLegExternalContext(props: Props) {
  const l = getNativeStepLegChain({ ...props, side: "l" }),
    r = getNativeStepLegChain({ ...props, side: "r" }),
    shoes = getNativeEasedShoeEnvelopes(props)
  if (l instanceof Error) return l
  if (r instanceof Error) return r
  if (shoes instanceof Error) return shoes
  const floor = getNativeShoeEnvelopeError({ shoes, boxes: props.boxes, ceiling: props.ceiling })
  if (floor) return floor

  return { ...props, chains: { l, r }, rootY: shoes.rootY }
}
