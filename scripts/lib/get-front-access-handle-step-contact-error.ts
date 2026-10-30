import { getNativePlantedFootwearError } from "#/world/scene/figure/get-native-planted-footwear-error"
import type { getFrontAccessHandleStepFrame } from "#/scripts/lib/get-front-access-handle-step-frame"
type Frame = Exclude<ReturnType<typeof getFrontAccessHandleStepFrame>, Error>
type Props = Readonly<{ from: Frame; to: Frame; leaf: "north" | "south"; phase: number }>

/** Compare the complete support shoe against an independently prepared authored anchor. */
export function getFrontAccessHandleStepContactError(props: Props): Error | null {
  const first: Readonly<Record<"north" | "south", "l" | "r">> = { north: "l", south: "r" }
  const second: Readonly<Record<"north" | "south", "l" | "r">> = { north: "r", south: "l" }
  const sides = props.phase > 0.5 ? second : first
  return getNativePlantedFootwearError({
    look: props.to.look,
    heading: Math.PI / 2,
    sides: [sides[props.leaf]],
    from: { skeleton: props.from.posed.skeleton, rootY: props.from.posed.rootY, body: props.from.body },
    to: { skeleton: props.to.posed.skeleton, rootY: props.to.posed.rootY, body: props.to.body },
  })
}
