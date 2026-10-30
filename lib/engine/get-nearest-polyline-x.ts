import type { Vector2 } from "#/lib/engine/vector2-types"

/** Select the first sampled point nearest the requested row; this does not interpolate between samples. */
export function getNearestPolylineX(row: number, points: readonly Vector2[]): number {
  const nearest = points.reduce(
    (closest, point) => {
      const distance = Math.abs(point[1] - row)
      if (distance < closest.distance) return { distance, x: point[0] }
      return closest
    },
    { distance: 1e9, x: 0 },
  )
  return nearest.x
}
