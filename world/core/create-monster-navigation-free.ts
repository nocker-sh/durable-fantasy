import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import { getSweptGridClearanceFailure } from "#/lib/engine/get-swept-grid-clearance-failure"
import { MONSTER_CELLS_PER_TILE, MONSTER_NAV_CELLS_PER_TILE } from "#/world/core/monster-motion-rules"
type Props = { area: readonly [number, number, number, number]; radius: number; free: (x: number, z: number) => boolean }
/** Each accepted resting point has a clear footprint and a clear connection to its route-grid node. */
export function createMonsterNavigationFree(props: Props) {
  if (props.radius === 0) return props.free
  const isCellFree = (cell: readonly [number, number]) => props.free((cell[0] + 0.5) / MONSTER_CELLS_PER_TILE, (cell[1] + 0.5) / MONSTER_CELLS_PER_TILE)
  return (x: number, z: number): boolean => {
    if (!props.free(x, z)) return false
    const scale = MONSTER_NAV_CELLS_PER_TILE
    const centre: Vector2Tuple = [
      Math.min(props.area[2], Math.max(props.area[0], (Math.floor(x * scale) + 0.5) / scale)),
      Math.min(props.area[3], Math.max(props.area[1], (Math.floor(z * scale) + 0.5) / scale)),
    ]
    return (
      getSweptGridClearanceFailure({
        from: [x, z],
        to: centre,
        radius: props.radius,
        cellSize: 1 / MONSTER_CELLS_PER_TILE,
        isCellFree,
      }) === null
    )
  }
}
