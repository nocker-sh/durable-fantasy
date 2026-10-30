import type { WindmillSectionPoint } from "#/scripts/lib/windmill-approach-section-types"
export function getWindmillSectionSegment(first: WindmillSectionPoint, last: WindmillSectionPoint, metres: number) {
  const length_m = Math.hypot(last.point[0] - first.point[0], last.point[1] - first.point[1]) * metres
  const rise_m = last.elevation_m - first.elevation_m
  const grade = Math.abs(rise_m) / length_m
  if (![length_m, rise_m, grade].every(Number.isFinite) || length_m <= 0) return new Error("Invalid windmill approach section segment")
  return { length_m, rise_m, grade }
}
