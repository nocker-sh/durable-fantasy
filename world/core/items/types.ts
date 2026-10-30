import type { Stat } from "#/world/core/growth-types"
import type { Skill, Grade, ItemKind, Rarity, GatherSkill } from "./kinds"
import type { ItemIcon } from "./icons"

/** Where an equipment item goes; accessories fit either accessory slot. */
/** neck is for looks: a worn neck wrap replaces the one chosen in the character screen */
export type EquipPart = "head" | "neck" | "body" | "weapon" | "shield" | "feet" | "accessory"

export type Equipment = {
  part: EquipPart
  /** attack added to ATK (weapons) */
  atk?: number
  /** defence added to DEF (armour) */
  def?: number
  /** stats and maximums it adds while worn */
  bonus?: Partial<Record<Stat | "maxHp" | "maxSp", number>>
  /** a two-handed weapon leaves no hand for a shield */
  twoHanded?: boolean
  /** stats (as raised, not with what is worn) and life skill levels needed to wear it */
  needs?: Partial<Record<Stat | Skill, number>>
  /** how its attack grows with stats (weapons) */
  scale?: Partial<Record<Stat, Grade>>
  /** milliseconds between blows with it (weapons) */
  delay?: number
  /** how a neck wrap looks when worn */
  look?: { neck: "muffler" | "stole" | "scarf"; neckRamp: string; neckStripe?: string }
}

export type ItemDefinition = {
  name: string
  kind: ItemKind
  rarity: Rarity
  description: string
  /** Shop price in gold. */
  price: number
  /** How many fit in one inventory slot. */
  stack: number
  weight: number
  icon: ItemIcon
  /** the metal its blade or head is drawn in, when not plain iron (items/weapons.ts, art/icons.ts) */
  metal?: "iron" | "steel" | "engine"
  /**
   * what using it does (consumables): restores HP, SP and stamina, fills you up by `full` (out of
   * 100) and keeps you warm for `warm` minutes (game-system.md §3.6)
   */
  use?: { hp?: number; sp?: number; stamina?: number; full?: number; warm?: number; focus?: number }
  /** made by someone: each one has a quality and a maker (§4.2.1), and its name carries the maker's */
  made?: true
  /** a gathering tool: what it gathers with, how much more it brings in, how many uses before it breaks (economy.md §1) */
  tool?: { skill: GatherSkill; power: number; durability: number }
  equip?: Equipment
  /** only a life skill at this milestone (16, 32, 64) brings it: gathers it or makes it (economy.md §2.1) */
  milestone?: 16 | 32 | 64
}
