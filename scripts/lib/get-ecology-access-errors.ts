import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import { MONSTER_CELLS_PER_TILE } from "#/world/core/monster-motion-rules"
import { getMonsterRoute } from "#/world/core/get-monster-route"
import { getMonsterBodyRadius } from "#/world/core/get-monster-body-radius"
import { walkable } from "#/world/maps/walkable"
import { type MapDefinition } from "#/world/maps/types"
import type { MonsterKind } from "#/world/core/monster-types"
import type { EcologySite } from "#/scripts/lib/ecology-zone-schema"
type Props = { site: EcologySite; map: MapDefinition; kind: MonsterKind }
/** Check the species' full body between the declared approaches while the terrain proposal remains unadopted. */
export function getEcologyAccessErrors(props: Props): string[] {
  const radius = getMonsterBodyRadius({ kind: props.kind })
  if (radius instanceof Error) return [radius.message]
  const grid = props.site.grid,
    ox = grid.origin_tiles[0],
    oz = grid.origin_tiles[1],
    errors: string[] = []
  const points = props.site.features.flatMap((feature) => feature.access.map((access): Vector2Tuple => [ox + (access[0] + 0.5) * grid.cell_tiles, oz + (access[1] + 0.5) * grid.cell_tiles]))
  const area: readonly [number, number, number, number] = [ox, oz, ox + grid.rows[0].length * grid.cell_tiles, oz + grid.rows.length * grid.cell_tiles]
  const free = (x: number, z: number) =>
    x >= area[0] && z >= area[1] && x < area[2] && z < area[3] && walkable(props.map, [Math.floor(x * MONSTER_CELLS_PER_TILE), Math.floor(z * MONSTER_CELLS_PER_TILE)])
  for (const point of points) {
    const route = getMonsterRoute({ from: points[0], to: point, area, radius, free })
    if (route instanceof Error) errors.push(`Habitat approach is unresolved: ${route.message}`)
  }
  return errors
}
