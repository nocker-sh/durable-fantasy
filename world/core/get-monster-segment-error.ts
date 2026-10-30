import { getSweptGridClearanceError } from "#/lib/engine/get-swept-grid-clearance-error"
import { getGridSegmentCoverage } from "#/lib/engine/get-grid-segment-coverage"
import { MONSTER_CELLS_PER_TILE } from "#/world/core/monster-motion-rules"
import type { V2 } from "#/lib/engine/pathfinder"
type Props = { from: V2; to: V2; radius: number; free: (x: number, z: number) => boolean }
/** The original terrain cells remain authoritative even when body-aware route searches use finer waypoints. */
export function getMonsterSegmentError(props: Props): Error | null {
  const scale = MONSTER_CELLS_PER_TILE
  if (!Number.isFinite(props.radius) || props.radius < 0) return new Error("Invalid monster body radius")
  if (props.radius === 0) {
    const cells = getGridSegmentCoverage({ from: props.from, to: props.to, cellSize: 1 / scale })
    if (cells instanceof Error) return cells
    if (!cells.every((cell) => props.free((cell[0] + 0.5) / scale, (cell[1] + 0.5) / scale))) return new Error("Monster centre route is blocked")
    return null
  }
  return getSweptGridClearanceError({ from: props.from, to: props.to, radius: props.radius, cellSize: 1 / scale, isCellFree: (cell) => props.free((cell[0] + 0.5) / scale, (cell[1] + 0.5) / scale) })
}
