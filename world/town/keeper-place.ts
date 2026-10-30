import type { Cell } from "#/world/town/interiors"
import { INTERIORS, OUT_FRONT } from "#/world/town/interiors"
import { keepersOf } from "#/world/town/keepers-of"

/**
 * Where a shopkeeper stands: behind the counter of their shop, if it is one you go into (a second
 * keeper one step aside). Null for everyone else, who stand where residents.ts puts them.
 */
export function keeperPlace(name: string): { map: string; cell: Cell } | null {
  if (Object.values(OUT_FRONT).includes(name)) return null
  for (const it of INTERIORS) {
    if (it.floor !== 0) continue
    const keepers = keepersOf(it)
    const k = keepers.indexOf(name)
    if (k >= 0) return { map: it.id, cell: [it.keeper[0] + k * 2, it.keeper[1]] }
  }
  return null
}
