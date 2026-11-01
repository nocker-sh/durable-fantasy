import type { Cell } from "#/world/town/interiors"
import { INTERIORS, OUT_FRONT } from "#/world/town/interiors"
import { keepersOf } from "#/world/town/keepers-of"
import { isInteriorCellOpen } from "#/world/town/is-interior-cell-open"

/** Steps aside from the middle of the counter, nearest first. */
const ASIDE = [0, 1, -1, 2, -2, 3, -3]

/**
 * Where a shopkeeper stands: behind the counter of their shop, if it is one you go into; a second keeper stands
 * a step aside, still behind the counter where it is long enough. Null for everyone else, who stand where
 * residents.ts puts them.
 */
export function keeperPlace(name: string): { map: string; cell: Cell } | null {
  if (Object.values(OUT_FRONT).includes(name)) return null
  for (const it of INTERIORS) {
    if (it.floor !== 0) continue
    const keepers = keepersOf(it)
    const k = keepers.indexOf(name)
    if (k < 0) continue
    const counter = it.furniture.find((f) => f.kind === "counter")
    // the open cells behind the counter whose middle lies over it (a cell is half a tile)
    const behind = ASIDE.filter((s) => (!counter || Math.abs((it.keeper[0] + s + 0.5) / 2 - counter.x) <= counter.w / 2 + 0.05) && (s === 0 || isInteriorCellOpen(it, it.keeper[0] + s, it.keeper[1])))
    const step = behind[k] ?? ASIDE[k] ?? k * 2
    return { map: it.id, cell: [it.keeper[0] + step, it.keeper[1]] }
  }
  return null
}
