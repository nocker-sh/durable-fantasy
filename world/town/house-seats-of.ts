import type { HouseDef } from "#/world/town/house-types"

/** Places to sit, read from the furniture: 椅子×n, a long bench seats three, a long table four a side. */
export function seatsOf(h: HouseDef): number {
  const seats = { count: 0 }
  for (const f of h.plan.furniture) {
    const count = Number(/×(\d+)/.exec(f)?.[1] ?? 1)
    if (f.startsWith("椅子")) seats.count += count
    else if (/長椅子/.test(f)) seats.count += 3 * count
    else if (/揺り椅子/.test(f)) seats.count += count
    else if (f.startsWith("長卓")) seats.count += 8 * count
  }
  return seats.count
}
