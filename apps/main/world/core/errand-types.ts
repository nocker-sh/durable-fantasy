import type { ItemId } from "#/world/core/items/catalog"

type ErrandDefinition = {
  id: string
  /** who asks */
  from: string
  /** what they say when they ask */
  ask: string
  /** what is said when it is done (by the one who receives it) */
  thanks: string
  gold: number
}

/** Bring materials to the asker, or deliver their parcel to another resident. */
export type Errand = ErrandDefinition & ({ kind: "bring"; wants: { item: ItemId; count: number } } | { kind: "deliver"; to: string; parcel: string })

/** An errand a player has taken: for today only. */
export type Taken = {
  id: string
  day: string
  done: boolean
}

export type ErrandProgress = "taken" | "ready" | "done"
