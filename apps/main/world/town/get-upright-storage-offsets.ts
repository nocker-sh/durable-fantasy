import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { bodyStart: readonly [number, number]; poses: ReadonlyArray<readonly [number, number]>; height: number }
/** Lift at pickup, preserve the held offset throughout the walk, then lower at staging without a horizontal jump. */
export function getUprightStorageOffsets(props: Props): ReadonlyArray<Point3> | Error {
  if (!Number.isFinite(props.height) || props.height <= 0 || !props.bodyStart.every(Number.isFinite) || props.poses.length < 2 || props.poses.some((pose) => !pose.every(Number.isFinite)))
    return new Error("Invalid upright storage approach")
  if (Math.hypot(props.poses[0][0] - props.bodyStart[0], props.poses[0][1] - props.bodyStart[1]) > 1e-9) return new Error("Upright storage approach does not join its pickup")

  const offsets: Point3[] = [[0, 0, 0]]
  for (const pose of props.poses) offsets.push([pose[0] - props.bodyStart[0], props.height, pose[1] - props.bodyStart[1]])
  const last = offsets[offsets.length - 1]
  offsets.push([last[0], 0, last[2]])
  return offsets
}
