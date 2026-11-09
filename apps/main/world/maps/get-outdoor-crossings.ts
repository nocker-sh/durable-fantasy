import { across } from "#/world/maps/across"
import { squareOf } from "#/world/maps/square-of"
import { getOutdoorCrossing } from "#/world/maps/get-outdoor-crossing"
import type { Side } from "#/world/maps/grid-types"
import type { MapDefinition, Warp } from "#/world/maps/types"

const sides: readonly Side[] = ["n", "e", "s", "w"]

export function getOutdoorCrossings(map: MapDefinition, maps: Readonly<Record<string, MapDefinition>>, regions: ReadonlyMap<string, ReadonlySet<number>>): Warp[] {
  const square = squareOf(map.id),
    crossings: Warp[] = []
  if (!square) return crossings
  for (const side of sides) {
    const neighbor = across(square, side)
    const there = neighbor?.map && Object.hasOwn(maps, neighbor.map) ? maps[neighbor.map] : undefined
    if (!there) continue
    const hereLand = regions.get(map.id),
      thereLand = regions.get(there.id)
    if (!hereLand || !thereLand) throw new Error(`Missing outdoor walk region: ${map.id} / ${there.id}`)
    const crossing = getOutdoorCrossing({ here: map, there, side, hereLand, thereLand })
    if (crossing) crossings.push(crossing)
  }
  return crossings
}
