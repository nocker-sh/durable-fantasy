import type { Interior } from "#/world/town/interiors"

/** The authored entrance joins the room floor; furniture and stair wells still block it. */
export function isInteriorCellOpen(interior: Interior, column: number, row: number): boolean {
  const x = (column + 0.5) / 2
  const z = (row + 0.5) / 2
  const inset = interior.shellInset ?? 0.2
  const cell = { free: x > interior.x0 + inset && x < interior.x1 - inset && z > interior.z0 + inset && z < interior.z1 - inset }
  if (interior.authored && interior.floor === 0 && interior.entrance) {
    const entrance = interior.entrance
    const dx = x - entrance.point[0]
    const dz = z - entrance.point[1]
    const normal = dx * entrance.outward[0] + dz * entrance.outward[1]
    const cross = -dx * entrance.outward[1] + dz * entrance.outward[0]
    if (Math.abs(cross) < (interior.doorWidth ?? NaN) / 2 - 0.15 && normal >= -inset && normal < 0) cell.free = true
  }
  if (cell.free)
    for (const furniture of interior.furniture)
      if (
        furniture.solid &&
        !(furniture.kind === "stair" && interior.stairSections?.length) &&
        Math.abs(x - furniture.x) < furniture.w / 2 + 0.15 &&
        Math.abs(z - furniture.z) < furniture.d / 2 + 0.15
      )
        cell.free = false
  if (cell.free) for (const block of interior.stairBlocks ?? []) if (x > block.x0 - 0.15 && x < block.x1 + 0.15 && z > block.z0 - 0.15 && z < block.z1 + 0.15) cell.free = false
  if (!interior.authored && column === interior.door[0] && row === interior.door[1]) cell.free = true
  return cell.free
}
