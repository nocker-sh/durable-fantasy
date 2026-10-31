import { OPPOSITE } from "#/world/maps/grid"
import { getCrossingCells } from "#/world/maps/get-crossing-cells"
import { walkable } from "#/world/maps/walkable"
import type { OutdoorCrossingContext } from "#/world/maps/outdoor-crossing-types"

/** Every trigger and arrival belongs to its own grid and its largest connected region. */
export function isCrossingPassable(context: OutdoorCrossingContext, at: number): boolean {
  const here = getCrossingCells(context.here.size, context.side, at),
    there = getCrossingCells(context.there.size, OPPOSITE[context.side], at)
  return [
    { map: context.here, land: context.hereLand, cell: here.at },
    { map: context.here, land: context.hereLand, cell: here.arrive },
    { map: context.there, land: context.thereLand, cell: there.at },
    { map: context.there, land: context.thereLand, cell: there.arrive },
  ].every((entry) => walkable(entry.map, entry.cell) && entry.land.has(entry.cell[1] * entry.map.size + entry.cell[0]))
}
