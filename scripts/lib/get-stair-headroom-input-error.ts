import type { StairHeadroom } from "#/scripts/lib/stair-headroom"

/** Unknown geometry stays unknown; known dimensions must support finite and monotone tread calculations. */
export function getStairHeadroomInputError(section: StairHeadroom): string | null {
  if (section.lower_ceiling_m === null || section.upper_ceiling_m === null || section.opening_length_m === null) return null

  const run = (section.risers - 1) * section.going_m
  if (
    ![
      section.bottom_m,
      section.top_m,
      section.lower_ceiling_m,
      section.upper_ceiling_m,
      section.going_m,
      section.opening_length_m,
      run,
      section.top_m - section.bottom_m,
      section.upper_ceiling_m - section.top_m,
    ].every(Number.isFinite) ||
    !Number.isSafeInteger(section.risers) ||
    section.risers < 2 ||
    section.going_m <= 0 ||
    section.top_m <= section.bottom_m
  )
    return "Invalid stair headroom dimensions"
  if (section.lower_ceiling_m <= section.bottom_m || section.lower_ceiling_m > section.top_m || section.upper_ceiling_m <= section.top_m) return "Stair ceiling elevations disagree with floors"
  if (section.opening_length_m < 0 || section.opening_length_m > run + 1e-9) return "Floor opening extends beyond the stair flight"

  return null
}
