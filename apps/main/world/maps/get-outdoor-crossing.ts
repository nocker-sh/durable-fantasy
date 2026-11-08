import { OPPOSITE } from "#/world/maps/grid"
import { getRoadEnds } from "#/world/maps/get-road-ends"
import { getCrossingCells } from "#/world/maps/get-crossing-cells"
import { isCrossingPassable } from "#/world/maps/is-crossing-passable"
import { CROSSING_EDGE, CROSSING_ARRIVAL_OFFSET } from "#/world/maps/crossing-rules"
import type { OutdoorCrossingContext } from "#/world/maps/outdoor-crossing-types"
import type { Warp } from "#/world/maps/types"

export function getOutdoorCrossing(context: OutdoorCrossingContext): Warp | undefined {
  const back = OPPOSITE[context.side],
    hints = [...getRoadEnds(context.here.id, context.side), ...getRoadEnds(context.there.id, back)]
  const hint = hints.length ? hints.reduce((sum, value) => sum + value, 0) / hints.length : context.here.size / 2
  const candidates = Array.from({ length: context.here.size - 2 * (CROSSING_EDGE + CROSSING_ARRIVAL_OFFSET) }, (_, index) => index + CROSSING_EDGE + CROSSING_ARRIVAL_OFFSET)
    .filter((at) => isCrossingPassable(context, at))
    .sort((a, b) => Math.abs(a - hint) - Math.abs(b - hint) || a - b)
  if (!candidates.length) return undefined
  return { at: getCrossingCells(context.here.size, context.side, candidates[0]).at, to: { map: context.there.id, at: getCrossingCells(context.there.size, back, candidates[0]).arrive } }
}
