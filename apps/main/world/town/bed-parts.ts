import { getBedFrameParts } from "#/world/town/get-bed-frame-parts"
import { getBedLinenParts } from "#/world/town/get-bed-linen-parts"
import type { BedPart } from "#/world/town/bed-types"
type Props = Parameters<typeof getBedFrameParts>[0]

/** Validate the complete made bed before drawing any part; unmeasured linen stays explicitly absent. */
export function bedParts(props: Props): readonly BedPart[] {
  const frame = getBedFrameParts(props)
  if (props.bed.linen === null) return frame
  const linen = getBedLinenParts({ ...props, linen: props.bed.linen })
  if (linen instanceof Error) throw linen

  return [...frame, ...linen]
}
