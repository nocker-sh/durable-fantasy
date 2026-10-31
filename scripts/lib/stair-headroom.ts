import { getFirstCoveredStairTread } from "#/scripts/lib/get-first-covered-stair-tread"
import { getStairHeadroomInputError } from "#/scripts/lib/get-stair-headroom-input-error"

export type StairHeadroom = {
  bottom_m: number
  top_m: number
  lower_ceiling_m: number | null
  upper_ceiling_m: number | null
  risers: number
  going_m: number
  opening_length_m: number | null
}

/** Landing clearances bound the upper-ceiling steps; only the highest covered tread can lower the remaining minimum. */
export function stairHeadroom(section: StairHeadroom): { minimum_m: number | null; problems: string[] } {
  if (section.lower_ceiling_m === null || section.upper_ceiling_m === null || section.opening_length_m === null) return { minimum_m: null, problems: [] }
  const problem = getStairHeadroomInputError(section)
  if (problem) return { minimum_m: null, problems: [problem] }

  const tread = getFirstCoveredStairTread({ first: 1, last: section.risers, going: section.going_m, threshold: section.opening_length_m + 1e-9 })
  const rise = (section.top_m - section.bottom_m) / section.risers
  const coveredClearance = tread < section.risers ? section.lower_ceiling_m - (section.top_m - tread * rise) : Infinity

  return { minimum_m: Math.min(section.lower_ceiling_m - section.bottom_m, section.upper_ceiling_m - section.top_m, coveredClearance), problems: [] }
}
