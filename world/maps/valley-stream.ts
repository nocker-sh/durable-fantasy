import type { Vector2Tuple } from "#/lib/engine/vector2-types"

// The valley's stream, from the spring on the high ground in the north-west, over the two falls,
// down to the pool in the south-east (map-falls-valley). The ground is cut along it and the water
// is drawn on it; it has no walkable surface of its own.
export const VALLEY_STREAM: readonly Vector2Tuple[] = [
  [3, 9],
  [8, 12],
  [13, 17],
  [17, 21],
  [20, 23],
  [24, 26],
  [27, 30],
  [30, 33.5],
  [33, 36],
  [36, 38.5],
]
/** Where the stream ends in the pool, and the pool's radius. */
export const VALLEY_POOL: readonly [number, number, number] = [38.5, 40, 6.5]
