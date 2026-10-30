import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import { getMonsterRouteInputError } from "#/world/core/get-monster-route-input-error"
import { createMonsterNavigationGrid } from "#/world/core/create-monster-navigation-grid"
import { createMonsterNavigationFree } from "#/world/core/create-monster-navigation-free"
import { MONSTER_CELLS_PER_TILE, MONSTER_NAV_CELLS_PER_TILE } from "#/world/core/monster-motion-rules"
import { GridPathfinder } from "#/lib/engine/grid-pathfinder"
type Props = { from: Vector2Tuple; to: Vector2Tuple; area: readonly [number, number, number, number]; radius: number; free: (x: number, z: number) => boolean }
/** Do not string-pull around obstacles: adjacent clear grid cells preserve corner clearance. */
export function getMonsterGridRoute(props: Props): Vector2Tuple[] | Error {
  const invalid = getMonsterRouteInputError(props)
  if (invalid) return invalid
  const scale = props.radius === 0 ? MONSTER_CELLS_PER_TILE : MONSTER_NAV_CELLS_PER_TILE
  const navigationFree = createMonsterNavigationFree(props)
  const navigation = createMonsterNavigationGrid({ area: props.area, cellsPerTile: scale, free: navigationFree })
  if (navigation instanceof Error) return navigation
  const grid = navigation.layout
  const clamp = (x: number, z: number): Vector2Tuple => [Math.min(props.area[2], Math.max(props.area[0], x)), Math.min(props.area[3], Math.max(props.area[1], z))]
  const path = new GridPathfinder({ blocked: navigation.blocked, size: grid.size, resolution: 1, clearance: 0 }).find(
    [props.from[0] * scale - grid.ox, props.from[1] * scale - grid.oz],
    [props.to[0] * scale - grid.ox, props.to[1] * scale - grid.oz],
    true,
  )
  if (!path) return new Error("Monster territory has disconnected resting points")
  return [props.from, ...path.map((point) => clamp((point[0] + grid.ox) / scale, (point[1] + grid.oz) / scale)), props.to]
}
