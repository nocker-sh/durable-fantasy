import type { Stats, Stat } from "#/world/core/growth-types"
import type { Quality, Slot } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"

export type Derived = {
  /** Equipment bonuses affect potency, but never equipment or art requirements. */
  stats: Stats
  maxHp: number
  maxSp: number
  atk: number
  def: number
  hit: number
  flee: number
  /** critical chance in percent */
  crit: number
  /** milliseconds between auto attacks */
  attackDelay: number
  /** how much can be carried */
  maxWeight: number
  /** HP and SP that come back every while (core/settle.ts) */
  regenHp: number
  regenSp: number
}

export type Build = {
  readonly level: number
  readonly stats: Stats
  readonly equipment: Readonly<Record<Slot, ItemId | null>>
  readonly worn?: Readonly<Partial<Record<Slot, { q?: Quality }>>>
}

export type EquipmentBonuses = Readonly<Partial<Record<Stat | "maxHp" | "maxSp", number>>>
