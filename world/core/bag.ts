// The inventory: a fixed number of slots, each empty or holding a stack of one item. A made thing
// also has a quality and a maker (game-system.md §4.2.1); only the same item of the same quality
// by the same maker stacks together. Every function is pure and returns a new bag; null means it
// could not be done.
import { ITEMS, QUALITY_EFFECT, type ItemId, type Quality } from "./items.ts"
import { usualMaker } from "./makers.ts"

/** A made thing's quality and maker. */
export interface Mark {
  readonly q: Quality
  readonly by: string
}

export interface Stack {
  readonly item: ItemId
  readonly count: number
  readonly q?: Quality
  readonly by?: string
  /** a tool's uses left (economy.md §1) */
  readonly dur?: number
}

/** How many uses a new tool has: more for a better one. */
export const fullDurability = (item: ItemId, q: Quality = 1) => (ITEMS[item].tool ? Math.round(ITEMS[item].tool!.durability * QUALITY_EFFECT[q]) : undefined)

export type Bag = readonly (Stack | null)[]

export const BAG_SIZE = 24

export function emptyBag(size = BAG_SIZE): Bag {
  return Array.from({ length: size }, () => null)
}

/** The mark a made thing gets when none is given: an ordinary one by its usual maker. */
export function markFor(item: ItemId, mark?: Partial<Mark>): Mark | undefined {
  if (!ITEMS[item].made) return undefined
  return { q: mark?.q ?? 1, by: mark?.by ?? usualMaker(item) }
}

const withMark = (item: ItemId, count: number, mark: Mark | undefined): Stack => {
  const dur = fullDurability(item, mark?.q)
  return { item, count, ...(mark ? { q: mark.q, by: mark.by } : {}), ...(dur !== undefined ? { dur } : {}) }
}

/** Is this stack the item (and, when given, of this quality and maker)? */
export function matches(slot: Stack | null, item: ItemId, mark?: Partial<Mark>): slot is Stack {
  if (slot?.item !== item) return false
  if (mark?.q !== undefined && slot.q !== mark.q) return false
  if (mark?.by !== undefined && slot.by !== mark.by) return false
  return true
}

/** Do two stacks hold the same kind of thing (and so may be stacked)? */
export const sameKind = (a: Stack, b: Stack) => a.item === b.item && a.q === b.q && a.by === b.by

export function countItem(bag: Bag, item: ItemId, mark?: Partial<Mark>): number {
  let total = 0
  for (const slot of bag) if (matches(slot, item, mark)) total += slot.count
  return total
}

/** How many more fit: room on stacks of the same kind plus empty slots. */
export function roomFor(bag: Bag, item: ItemId, mark?: Partial<Mark>): number {
  const stack = ITEMS[item].stack
  const m = markFor(item, mark)
  let room = 0
  for (const slot of bag) {
    if (!slot) room += stack
    else if (sameKind(slot, withMark(item, 0, m))) room += stack - slot.count
  }
  return room
}

/** Add items, topping up stacks of the same kind first, then filling empty slots in order. */
export function addItem(bag: Bag, item: ItemId, count: number, mark?: Partial<Mark>): Bag | null {
  if (!Number.isInteger(count) || count <= 0) return null
  if (roomFor(bag, item, mark) < count) return null
  const m = markFor(item, mark)
  const kind = withMark(item, 0, m)
  const stack = ITEMS[item].stack
  const next = [...bag]
  let left = count
  for (let i = 0; i < next.length && left > 0; i++) {
    const slot = next[i]
    if (!slot || !sameKind(slot, kind) || slot.count >= stack) continue
    const put = Math.min(left, stack - slot.count)
    next[i] = withMark(item, slot.count + put, m)
    left -= put
  }
  for (let i = 0; i < next.length && left > 0; i++) {
    if (next[i]) continue
    const put = Math.min(left, stack)
    next[i] = withMark(item, put, m)
    left -= put
  }
  return next
}

/** Remove items (of any quality and maker unless given), taking from the last stacks first. */
export function removeItem(bag: Bag, item: ItemId, count: number, mark?: Partial<Mark>): Bag | null {
  if (!Number.isInteger(count) || count <= 0) return null
  if (countItem(bag, item, mark) < count) return null
  const next = [...bag]
  let left = count
  for (let i = next.length - 1; i >= 0 && left > 0; i--) {
    const slot = next[i]
    if (!matches(slot, item, mark)) continue
    const take = Math.min(left, slot.count)
    next[i] = slot.count === take ? null : { ...slot, count: slot.count - take }
    left -= take
  }
  return next
}

/** Remove items from one slot. */
export function takeFromSlot(bag: Bag, index: number, count: number): Bag | null {
  const slot = bag[index]
  if (!slot || !Number.isInteger(count) || count <= 0 || count > slot.count) return null
  const next = [...bag]
  next[index] = slot.count === count ? null : { ...slot, count: slot.count - count }
  return next
}

/** Put a stack into a bag as it is (a worn tool keeps its wear); null when there is no room. */
export function putStack(bag: Bag, s: Stack): Bag | null {
  if (s.dur === undefined) return addItem(bag, s.item, s.count, s.q !== undefined ? { q: s.q, by: s.by } : undefined)
  const i = bag.findIndex((x) => !x)
  if (i < 0) return null
  const next = [...bag]
  next[i] = { ...s }
  return next
}

/** The first stack of the item, for using it from the hotbar. */
export function firstOf(bag: Bag, item: ItemId): number {
  return bag.findIndex((s) => s?.item === item)
}

/** Drag one slot onto another: top up a matching stack that has room, otherwise swap. */
export function moveSlot(bag: Bag, from: number, to: number): Bag | null {
  if (!isSlot(bag, from) || !isSlot(bag, to)) return null
  const source = bag[from]
  if (!source) return null
  if (from === to) return bag
  const target = bag[to]
  const next = [...bag]
  const put = target && sameKind(target, source) ? Math.min(source.count, ITEMS[source.item].stack - target.count) : 0
  if (target && put > 0) {
    next[to] = { ...target, count: target.count + put }
    next[from] = source.count === put ? null : { ...source, count: source.count - put }
    return next
  }
  next[to] = source
  next[from] = target
  return next
}

export function isSlot(bag: Bag, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < bag.length
}
