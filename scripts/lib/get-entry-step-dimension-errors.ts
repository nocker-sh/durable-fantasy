import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
import type { EntryStepGeometry } from "#/scripts/lib/entry-step-geometry-types"
import { MAX_STAIR_RISER_M, MIN_PASSAGE_WIDTH_M, MIN_STAIR_GOING_M } from "#/scripts/lib/spatial-rules"
export function getEntryStepDimensionErrors(steps: EntrySteps, geometry: EntryStepGeometry): string[] {
  const errors: string[] = []
  if (geometry.rise <= 0 || geometry.rise > MAX_STAIR_RISER_M) errors.push("Entry stair riser is invalid or too high")
  if (steps.going_m < MIN_STAIR_GOING_M) errors.push("Entry stair going is too short")
  if (steps.clear_width_m < MIN_PASSAGE_WIDTH_M || geometry.width > geometry.doorwayWidth + 1e-9) errors.push("Entry stair width does not fit the doorway")
  if (steps.landing_depth_m < steps.clear_width_m) errors.push("Entry stair landing is too shallow")
  return errors
}
