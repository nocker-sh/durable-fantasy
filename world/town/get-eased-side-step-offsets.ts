import { smooth } from "#/lib/engine/smooth"
import { getSideStepOffsets } from "#/world/town/get-side-step-offsets"
type Props = Parameters<typeof getSideStepOffsets>[0]

/** Ease the pelvis as well as the swinging shoes; linear body motion would push a just-releasing knee through the floor near an endpoint. */
export function getEasedSideStepOffsets(props: Props) {
  const offsets = getSideStepOffsets(props)
  if (offsets instanceof Error) return offsets
  const progress = smooth(0, 1, props.phase),
    direction = { left: 1, right: -1 },
    shift = (props.phase - progress) * props.stride * direction[props.direction]

  return {
    body: progress * props.stride * direction[props.direction],
    l: [offsets.l[0] + shift, offsets.l[1], offsets.l[2]] satisfies readonly [number, number, number],
    r: [offsets.r[0] + shift, offsets.r[1], offsets.r[2]] satisfies readonly [number, number, number],
  }
}
