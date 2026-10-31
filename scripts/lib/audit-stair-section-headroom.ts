import { stairHeadroom } from "#/scripts/lib/stair-headroom"
import { MIN_STAIR_HEADROOM_M } from "#/scripts/lib/spatial-rules"
import type { StairSection, StairSectionFrame } from "#/scripts/lib/stair-section-types"

type Props = Readonly<{ section: StairSection; frame: StairSectionFrame; isDesigned: boolean }>

/** Unknown headroom remains unknown and cannot pass a completed building's design gate. */
export function auditStairSectionHeadroom(props: Props): string[] {
  const clearance = stairHeadroom({
    bottom_m: props.frame.bottom,
    top_m: props.frame.top,
    risers: props.section.risers,
    going_m: props.section.going_m,
    opening_length_m: props.section.opening_length_m,
    lower_ceiling_m: props.frame.lowerCeiling,
    upper_ceiling_m: props.frame.upperCeiling,
  })
  const errors = [...clearance.problems]

  if (clearance.minimum_m === null) {
    if (props.isDesigned) errors.push("Stair headroom is not established")
    return errors
  }
  if (clearance.minimum_m + 1e-9 < MIN_STAIR_HEADROOM_M) errors.push("Stair headroom is not established")

  return errors
}
