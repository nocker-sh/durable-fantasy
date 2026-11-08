import type { Cell } from "#/world/protocol"
export type WalkTargetOptions = { snapToWarp?: boolean }
/** Explicit markers keep their destination; a free click may select the nearest doorway. */
export function minimapTarget(inputProps2: { x: number; z: number; warps: readonly { at: Readonly<Cell> }[]; inputProps?: WalkTargetOptions }): { x: number; z: number } {
  const x = inputProps2.x
  const z = inputProps2.z
  const warps = inputProps2.warps
  const inputProps = inputProps2.inputProps === undefined ? {} : inputProps2.inputProps

  const snapToWarpValue = inputProps.snapToWarp
  const snapToWarp = snapToWarpValue === undefined ? true : snapToWarpValue

  let target = { x, z },
    nearest = Infinity
  if (!snapToWarp) return target
  for (const warp of warps) {
    const point = { x: (warp.at[0] + 0.5) / 2, z: (warp.at[1] + 0.5) / 2 },
      distance = Math.hypot(point.x - x, point.z - z)
    if (distance <= 3 && distance < nearest) {
      target = point
      nearest = distance
    }
  }
  return target
}
