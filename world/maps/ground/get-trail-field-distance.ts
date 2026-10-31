import type { Polyline } from "#/lib/engine/polyline"

/** Missing trails keep the established distant sentinel; repeated or crossing trails take the minimum distance. */
export function getTrailFieldDistance(x: number, z: number, trails: readonly Polyline[]): number {
  return trails.reduce((nearest, trail) => Math.min(nearest, trail.distance(x, z)), 1e9)
}
