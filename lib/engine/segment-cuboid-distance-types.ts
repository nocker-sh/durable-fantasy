import type { Point3 } from "#/lib/engine/cuboid-motion-types"

export type SegmentCuboidDistanceQuery = Readonly<{ low: Point3; high: Point3; origin: Point3; delta: Point3 }>
export type SegmentCuboidDistanceInterval = Readonly<{ query: SegmentCuboidDistanceQuery; start: number; end: number }>
