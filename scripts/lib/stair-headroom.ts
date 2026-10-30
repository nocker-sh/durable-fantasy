export type StairHeadroom = {
  bottom_m: number
  top_m: number
  lower_ceiling_m: number | null
  upper_ceiling_m: number | null
  risers: number
  going_m: number
  opening_length_m: number | null
}
/** Opening starts at the upper landing and extends down the straight flight. */
export function stairHeadroom(section: StairHeadroom): { minimum_m: number | null; problems: string[] } {
  const bottom_mSource = section,
    bottom_m = bottom_mSource.bottom_m,
    top_m = bottom_mSource.top_m,
    lower_ceiling_m = bottom_mSource.lower_ceiling_m,
    upper_ceiling_m = bottom_mSource.upper_ceiling_m,
    risers = bottom_mSource.risers,
    going_m = bottom_mSource.going_m,
    opening_length_m = bottom_mSource.opening_length_m
  if (lower_ceiling_m === null || upper_ceiling_m === null || opening_length_m === null) return { minimum_m: null, problems: [] }
  const run = (risers - 1) * going_m
  if (lower_ceiling_m <= bottom_m || lower_ceiling_m > top_m || upper_ceiling_m <= top_m) return { minimum_m: null, problems: ["Stair ceiling elevations disagree with floors"] }
  if (opening_length_m < 0 || opening_length_m > run + 1e-9) return { minimum_m: null, problems: ["Floor opening extends beyond the stair flight"] }
  const clearances = [lower_ceiling_m - bottom_m, upper_ceiling_m - top_m],
    rise = (top_m - bottom_m) / risers
  for (let step = 0; step < risers - 1; step++) {
    const start = step * going_m,
      end = (step + 1) * going_m,
      height = top_m - (step + 1) * rise
    if (start < opening_length_m - 1e-9) clearances.push(upper_ceiling_m - height)
    if (end > opening_length_m + 1e-9) clearances.push(lower_ceiling_m - height)
  }
  return { minimum_m: Math.min(...clearances), problems: [] }
}
