import { MAX_STAIR_RISER_M, MIN_STAIR_GOING_M, MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { StairSection, StairSectionFrame } from "#/scripts/lib/stair-section-types"

type Props = Readonly<{ section: StairSection; frame: StairSectionFrame; isDesigned: boolean }>

/** These checks retain the full physical tread, landing and rail allowances. */
export function auditStairSectionDimensions(props: Props): string[] {
  const errors: string[] = [],
    section = props.section,
    frame = props.frame

  if ((frame.top - frame.bottom) / section.risers > MAX_STAIR_RISER_M) errors.push("Stair riser is too high")
  if (section.going_m < MIN_STAIR_GOING_M) errors.push("Stair going is too short")
  if (section.clear_width_m < MIN_PASSAGE_WIDTH_M || section.clear_width_m > frame.width - 2 * (section.rail_inset_m ?? 0) + 1e-9) errors.push("Stair clear width does not fit its footprint")
  if (section.rail_inset_m === undefined && props.isDesigned) errors.push("Stair rails have no designed allowance")
  if (section.landing_depth_m < section.clear_width_m) errors.push("Stair landing is shallower than its clear width")
  if ((section.risers - 1) * section.going_m + 2 * section.landing_depth_m > frame.length + 1e-9) errors.push("Stair run and landings do not fit its footprint")

  return errors
}
