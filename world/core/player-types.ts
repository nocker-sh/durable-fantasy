import type { Stats } from "#/world/core/growth-types"
import type { LifeExp } from "#/world/core/life-types"
import type { Order } from "#/world/core/commission-types"
import type { Taken } from "#/world/core/errand-types"
import type { Bag } from "#/world/core/bag-types"
import type { Thread } from "#/world/core/threads"
import type { Slot, Quality } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"
import type { NECK_KINDS } from "#/world/core/player-rules"
import type { SkillKey } from "#/world/core/skill-types"

export type SavePoint = {
  readonly map: string
  readonly cell: readonly [number, number]
}

export type PlayerState = {
  readonly version: 3
  /** Monotonic server publication; unrelated to the save format version. */
  readonly revision: number
  readonly name: string
  readonly profileComplete: boolean
  /** index into the look presets */
  readonly look: number
  /** what they wrap round the neck, and its colour (everyone wears one) */
  readonly neck: NeckKind
  readonly neckRamp: string
  readonly level: number
  readonly exp: number
  readonly statPoints: number
  readonly stats: Stats
  readonly gold: number
  readonly hp: number
  /** when HP last came back by a point (it recovers slowly while up; 0 HP is fallen and stays so) */
  readonly hpAt: number
  /** when SP last came back */
  readonly spAt: number
  /** sitting to rest: HP and SP come back twice as fast (core/skills.ts "sit") */
  readonly sitting: boolean
  /** when each skill can be used again (ms) */
  readonly ready: Readonly<Record<string, number>>
  readonly sp: number
  /** 0–100: spent on gathering, making, fighting and the road out of town (game-system.md §3.6) */
  readonly stamina: number
  /** how full they are (0–100) as of `fullAt`; it goes down by one every three minutes */
  readonly full: number
  readonly fullAt: number
  /** warm until this time (ms) */
  readonly warmUntil: number
  /** Food focus: extra SP recovery between these server timestamps. */
  readonly focusAt: number
  readonly focusUntil: number
  /** experience in each life skill; the levels follow from it (core/life-level.ts, game-system.md §9.1) */
  readonly life: LifeExp
  /** work left with resident craftsmen (economy.md §3) */
  readonly orders: readonly Order[]
  /** how well each resident knows them, 0–100 (economy.md §6) */
  readonly friends: Readonly<Record<string, number>>
  /** errands taken today (core/errand-types.ts) */
  readonly errands: readonly Taken[]
  /** the day they last bought from each resident (friendship from buying comes once a day) */
  readonly boughtOn: Readonly<Record<string, string>>
  readonly bag: Bag
  /** what is left with the town warehouse (core/storage/rules.ts) */
  readonly storage: Bag
  /** the party they are in (core/party.ts), if any */
  readonly party: string | null
  /** threads swapped with friends (core/threads.ts) */
  readonly threads: readonly Thread[]
  readonly equipment: Readonly<Record<Slot, ItemId | null>>
  /** what a worn thing carries with it: its quality, maker and wear (core/bag-types.ts Stack) */
  readonly worn: Readonly<Partial<Record<Slot, Worn>>>
  /** Items bound to the number keys 1-0. */
  readonly hotbar: readonly (HotbarEntry | null)[]
  /** where the player comes back after dying */
  readonly savePoint: SavePoint
}

export type Worn = {
  readonly q?: Quality
  readonly by?: string
  readonly dur?: number
}

export type NeckKind = (typeof NECK_KINDS)[number]

/** What comes back: the most, and how much each while (derive.ts). */
export type Rest = {
  maxHp: number
  maxSp: number
  regenHp: number
  regenSp: number
}

/** What can sit on the shortcut bar: an item, or a skill ("skill:first-aid"). */
export type HotbarEntry = ItemId | SkillKey
