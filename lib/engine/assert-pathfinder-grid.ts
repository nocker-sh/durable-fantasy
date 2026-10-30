import type { GridPathfinderProps } from "#/lib/engine/grid-pathfinder-types"

/** Validate grid dimensions and sampling parameters before a pathfinder snapshots configuration. */
export function assertPathfinderGrid(props: GridPathfinderProps): void {
  if (
    !Number.isSafeInteger(props.size) ||
    props.size <= 0 ||
    props.blocked.length < props.size ** 2 ||
    !Number.isFinite(props.resolution) ||
    props.resolution <= 0 ||
    !Number.isFinite(props.clearance) ||
    props.clearance < 0
  )
    throw new RangeError("Invalid pathfinder grid")
}
