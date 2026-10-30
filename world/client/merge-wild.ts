import type { CreatureHealth } from "#/world/core/wild/types"
import type { WildView } from "#/world/client/wild-publication"
import { currentCreature } from "#/world/client/current-creature"

/** A newer hit on one creature cannot discard a still-useful update for another. */
export function mergeWild(current: WildView, incoming: Record<string, CreatureHealth>, revision?: number): WildView {
  const next = { view: current }
  for (const entry of Object.entries(incoming)) {
    const id = entry[0]
    const health = entry[1]
    const previous = current[id]
    if (!currentCreature(previous, revision)) continue
    if (previous?.hp === health.hp && previous.back === health.back && previous.revision === revision) continue
    if (next.view === current) next.view = { ...current }
    next.view[id] = { ...health, ...(revision !== undefined ? { revision } : {}) }
  }
  return next.view
}
