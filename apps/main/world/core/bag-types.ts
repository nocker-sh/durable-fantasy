import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"

/** A made thing's quality and maker. */
export type Mark = {
  readonly q: Quality
  readonly by: string
}

export type Stack = {
  readonly item: ItemId
  readonly count: number
  readonly q?: Quality
  readonly by?: string
  /** a tool's uses left (economy.md §1) */
  readonly dur?: number
}

export type Bag = readonly (Stack | null)[]
