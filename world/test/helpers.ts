// Shared helpers for the core tests.
import { addItem, emptyBag, type Bag } from "../core/bag.ts"
import type { ItemId } from "../core/items.ts"
import { newPlayer, type PlayerState } from "../core/player.ts"

export const player = (patch: Partial<PlayerState> = {}): PlayerState => ({ ...newPlayer(), ...patch })

export const bagWith = (...items: [ItemId, number][]): Bag => items.reduce<Bag>((bag, [id, n]) => addItem(bag, id, n)!, emptyBag())
