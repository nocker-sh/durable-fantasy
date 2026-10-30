import type { V2 } from "#/lib/engine/pathfinder"
import { getMonsterGridLayout } from "#/world/core/get-monster-grid-layout"
type Props = { area: readonly [number, number, number, number]; cellsPerTile: number; free: (x: number, z: number) => boolean }
/** Exhaust the territory's cells rather than falling back to an unchecked, possibly blocked centre. */
export function getMonsterFallbackHome(props: Props): V2 | Error {
  const scale = props.cellsPerTile,
    grid = getMonsterGridLayout({ area: props.area, cellsPerTile: scale, storage: "rectangle" })
  if (grid instanceof Error) return grid
  const cursor = { index: 0 }
  while (cursor.index < grid.count) {
    const index = cursor.index++
    const x = Math.min(props.area[2], Math.max(props.area[0], (grid.ox + (index % grid.width) + 0.5) / scale))
    const z = Math.min(props.area[3], Math.max(props.area[1], (grid.oz + Math.floor(index / grid.width) + 0.5) / scale))
    if (props.free(x, z)) return [x, z]
  }
  return new Error("Monster territory has no walkable resting point")
}
