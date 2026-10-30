import { catmullCoordinate } from "#/lib/engine/catmull-coordinate"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"

/** Clamp endpoint tangents by repeating their control point, and retain the original final point. */
export function getCatmullPath(points: readonly Vector2Tuple[], samplesPerSegment = 8): Vector2Tuple[] {
  if (!Number.isSafeInteger(samplesPerSegment) || samplesPerSegment <= 0) throw new RangeError("Curve sampling requires a positive integer")
  if (points.length === 0) return []

  const controls = [points[0], ...points, points[points.length - 1]]
  const samples = getIntegerRange(0, samplesPerSegment)
  const curve: Vector2Tuple[] = []
  for (const index of getIntegerRange(1, controls.length - 2)) {
    const previous = controls[index - 1],
      start = controls[index],
      end = controls[index + 1],
      next = controls[index + 2]
    for (const sample of samples) {
      const time = sample / samplesPerSegment
      curve.push([
        catmullCoordinate({ previous: previous[0], start: start[0], end: end[0], next: next[0], time }),
        catmullCoordinate({ previous: previous[1], start: start[1], end: end[1], next: next[1], time }),
      ])
    }
  }
  curve.push(points[points.length - 1])
  return curve
}
