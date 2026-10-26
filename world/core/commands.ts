// Commands a player can send to change their own data, and why one can be refused.
import { z } from "zod"
import { BAG_SIZE, type Stack } from "./bag.ts"
import { STATS, type Stat } from "./growth.ts"
import { SLOTS, type CraftSkill, type GatherSkill, type ItemId, type Quality, type Slot } from "./items.ts"
import { HOTBAR_SIZE, LOOK_COUNT, NECK_KINDS, NECK_RAMPS, hotbarEntry, itemId, nameSchema } from "./player.ts"
import { isShopId, type ShopId } from "./shops.ts"
import { LIFE_SKILLS } from "./life.ts"
import { SKILL_IDS, type SkillId } from "./skills.ts"
import type { Thread } from "./threads.ts"

const shopId = z.custom<ShopId>((value) => typeof value === "string" && isShopId(value), "unknown shop")
const slotIndex = z
  .number()
  .int()
  .min(0)
  .max(BAG_SIZE - 1)
const equipSlot = z.enum(SLOTS)
const count = z.number().int().min(1).max(99)

export const commandSchema = z.discriminatedUnion("type", [
  /** made things: which quality (the maker is the shop's) */
  z.object({
    type: z.literal("buy"),
    shop: shopId,
    item: itemId,
    count,
    q: z.literal([0, 1, 2, 3] as const).optional(),
    /** the price the buyer saw; refused if it moved */ price: z.number().int().min(1).optional(),
  }),
  z.object({ type: z.literal("sell"), shop: shopId, slot: slotIndex, count }),
  z.object({ type: z.literal("use"), slot: slotIndex }),
  z.object({ type: z.literal("use-item"), item: itemId }),
  z.object({ type: z.literal("move"), from: slotIndex, to: slotIndex }),
  /** wear the item in a bag slot; `to` picks one of two accessory slots */
  z.object({ type: z.literal("equip"), slot: slotIndex, to: equipSlot.optional() }),
  z.object({ type: z.literal("unequip"), slot: equipSlot }),
  z.object({ type: z.literal("raise"), stat: z.enum(STATS) }),
  z.object({ type: z.literal("forget-life"), skill: z.enum(LIFE_SKILLS), exp: z.number().int().nonnegative() }),
  /** skills (core/skills.ts): first aid or a prayer on yourself, sit down to rest, get up */
  z.object({ type: z.literal("cast"), skill: z.enum(SKILL_IDS) }),
  z.object({ type: z.literal("sit") }),
  z.object({ type: z.literal("stand") }),
  z.object({
    type: z.literal("hotbar"),
    index: z
      .number()
      .int()
      .min(0)
      .max(HOTBAR_SIZE - 1),
    item: hotbarEntry.nullable(),
  }),
  z.object({
    type: z.literal("profile"),
    name: nameSchema,
    look: z
      .number()
      .int()
      .min(0)
      .max(LOOK_COUNT - 1),
    neck: z.enum(NECK_KINDS),
    neckRamp: z.enum(NECK_RAMPS),
  }),
])

export type Command = z.infer<typeof commandSchema>

/** What only the server does to a player: tire them on the road out of town (game-system.md §3.6). */
export type ServerCommand =
  | { type: "tire"; amount: number }
  /** a go at a gathering spot the room has taken from nature.ts; `roll` is the server's dice (0–1) */
  | { type: "gather"; node: string; roll: number }
  /** a go at a recipe at a station the room has checked the player stands by */
  | { type: "craft"; recipe: string; station: string; roll: number }
  /** leave work with a craftsman the room has checked is at their counter */
  | { type: "order"; commission: string; roll: number }
  | { type: "collect"; index: number }
  /** the exchange holds goods or gold while an order is up (core/exchange.ts) */
  | { type: "escrow-sell"; slot: number; qty: number; fee: number }
  | { type: "escrow-buy"; gold: number }
  | { type: "receive"; gold: number; items: readonly { item: ItemId; count: number; q?: Quality; by?: string }[] }
  /** a creature beaten: experience and what it left (game-system.md §8) */
  | { type: "loot"; monster: string; exp: number; items: readonly ItemId[] }
  /** take on today's errand from the resident the room has checked we are talking to (core/errands.ts) */
  | { type: "errand-take"; errand: string; from: string }
  /** hand an errand over to the resident the room has checked we are talking to */
  | { type: "errand-hand"; errand: string; to: string }
  /** a creature struck back (game-system.md §8); at 0 HP they fall */
  | { type: "hurt"; amount: number; by: string }
  /** fallen, they come to in town: half HP, a little experience lost */
  | { type: "revive" }
  /** leave a lot with the warehouse, or take one back (the room has checked the keeper is at her counter) */
  | { type: "store"; slot: number; count: number }
  | { type: "retrieve"; index: number; count: number }
  /** a face-to-face trade (core/trade.ts): the room takes what one side put up, then hands over the other's */
  | { type: "trade-out"; offer: { lots: readonly { slot: number; count: number }[]; gold: number } }
  | { type: "trade-in"; stacks: readonly Stack[]; gold: number }
  /** join or leave a party (core/party.ts) */
  | { type: "set-party"; party: string | null }
  /** a thread swapped with a friend (core/threads.ts) */
  | { type: "thread"; thread: Thread }
  /** a share of a creature a party member beat */
  | { type: "share"; exp: number; monster: string }
  /** pay for an art's blow (SP and the wait) before the room rolls it (game-system.md §9.3) */
  | { type: "art"; skill: SkillId }

/** Commands that are only allowed next to a particular NPC (checked by the map room). */
export const shopOf = (command: Command): ShopId | null => (command.type === "buy" || command.type === "sell" ? command.shop : null)

export type Reason =
  | "NOT_SOLD_HERE"
  | "NOT_SELLABLE"
  | "NO_GOLD"
  | "BAG_FULL"
  | "TOO_HEAVY"
  | "EMPTY_SLOT"
  | "NOT_ENOUGH"
  | "NOT_USABLE"
  | "HP_FULL"
  | "SP_FULL"
  | "NOT_EQUIPPABLE"
  | "STAT_TOO_LOW"
  | "SKILL_TOO_LOW"
  | "NO_WEAPON"
  | "NO_HERB"
  | "ROAD_CLOSED"
  | "TWO_HANDED"
  | "NOTHING_EQUIPPED"
  | "NOT_OWNED"
  | "LIFE_CHANGED"
  | "LIFE_EQUIPPED"
  | "NO_LIFE_EXP"
  | "NO_POINTS"
  | "STAT_MAX"
  | "TOO_FAR"
  | "OFFLINE"
  | "TOO_FULL"
  | "NOTHING_TO_GAIN"
  | "CLOSED"
  | "SOLD_OUT"
  | "PRICE_CHANGED"
  | "EXHAUSTED"
  | "NO_TOOL"
  | "SPENT"
  | "WRONG_STATION"
  | "NOT_SKILLED"
  | "MISSING_INPUTS"
  | "TOO_MANY_ORDERS"
  | "NOT_READY"
  | "NOT_WANTED"
  | "NO_ERRAND"
  | "TOO_MANY_ERRANDS"
  | "FALLEN"
  | "NOT_FALLEN"
  | "TAKEN"
  | "STORAGE_FULL"
  | "NOT_STORABLE"
  | "NOT_TRADABLE"
  | "COOLDOWN"
  | "SP_SHORT"

export type GameEvent =
  | { type: "bought"; item: ItemId; count: number; cost: number; by?: string }
  | { type: "sold"; item: ItemId; count: number; gain: number }
  | { type: "used"; item: ItemId; hp: number; sp: number; stamina: number; warm: number; by?: string }
  | { type: "tired"; stamina: number }
  | { type: "gathered"; item: ItemId; count: number; skill: GatherSkill; level: number; up: boolean; broke: ItemId | null }
  | { type: "ordered"; commission: string; readyAt: number }
  | { type: "escrowed"; item: ItemId | null; q?: Quality; by?: string; gold: number }
  | { type: "received"; gold: number; items: number }
  | { type: "looted"; monster: string; exp: number; items: readonly ItemId[]; level: number; gained: number }
  | { type: "collected"; item: ItemId; count: number; q: Quality | null; by: string }
  | { type: "crafted"; item: ItemId; count: number; q: Quality | null; skill: CraftSkill; level: number; up: boolean; fee: number }
  | { type: "spoiled"; recipe: string; skill: CraftSkill; level: number; up: boolean; fee: number }
  | { type: "equipped"; item: ItemId; slot: Slot }
  | { type: "unequipped"; item: ItemId; slot: Slot }
  | { type: "raised"; stat: Stat; value: number }
  | { type: "renamed"; name: string }
  | { type: "rearranged" }
  | { type: "errand-taken"; errand: string }
  | { type: "hurt"; amount: number; by: string; hp: number }
  | { type: "fell"; by: string }
  | { type: "revived"; hp: number; lost: number }
  | { type: "stored"; item: ItemId; count: number; fee: number; by?: string }
  | { type: "retrieved"; item: ItemId; count: number; by?: string }
  | { type: "traded-out"; stacks: Stack[]; gold: number }
  | { type: "traded-in"; stacks: Stack[]; gold: number }
  | { type: "partied"; party: string | null }
  | { type: "threaded"; name: string }
  | { type: "cast"; skill: SkillId; hp: number }
  | { type: "art"; skill: SkillId }
  | { type: "sat" }
  | { type: "stood" }
  | { type: "shared"; monster: string; exp: number; level: number; gained: number }
  | { type: "errand-done"; errand: string; gold: number; friends: Readonly<Record<string, number>> }

/** Text the UI shows for a refusal. */
export const REASON_TEXT: Record<Reason, string> = {
  NOT_SOLD_HERE: "この店では扱っていない。",
  NOT_SELLABLE: "それは売れない。",
  NO_GOLD: "所持金が足りない。",
  BAG_FULL: "持ち物がいっぱいで入らない。",
  TOO_HEAVY: "重くてこれ以上持てない。",
  EMPTY_SLOT: "そこには何もない。",
  NOT_ENOUGH: "そんなに持っていない。",
  NOT_USABLE: "それは使えない。",
  HP_FULL: "HP は満ちている。",
  SP_FULL: "SP は満ちている。",
  NOT_EQUIPPABLE: "それは装備できない。",
  STAT_TOO_LOW: "能力が足りない。",
  SKILL_TOO_LOW: "生活スキルの腕が足りない。",
  NO_WEAPON: "その技に合う武器を手にしていない。",
  NO_HERB: "薬草を持っていない。",
  ROAD_CLOSED: "この先はまだ通れない。",
  TWO_HANDED: "両手武器を持っているので盾は持てない。",
  NOTHING_EQUIPPED: "何も装備していない。",
  NOT_OWNED: "それを持っていない。",
  NO_POINTS: "能力ポイントが足りない。",
  STAT_MAX: "これ以上は上げられない。",
  TOO_FAR: "遠すぎる。もっと近づいて。",
  LIFE_CHANGED: "生活スキルの経験が変わった。もう一度確認してほしい。",
  LIFE_EQUIPPED: "このスキルが必要な装備を先に外してほしい。",
  NO_LIFE_EXP: "まだ忘れる経験がない。",
  OFFLINE: "接続が切れている。",
  TOO_FULL: "もうお腹いっぱいだ。",
  NOTHING_TO_GAIN: "いまは食べても飲んでも変わらない。",
  CLOSED: "いまは店番がいない。",
  SOLD_OUT: "売り切れだ。次の焼き上がりを待とう。",
  PRICE_CHANGED: "値段が変わった。もう一度見てから買おう。",
  EXHAUSTED: "くたくたで、これ以上は進めない。何か食べよう。",
  NO_TOOL: "道具がない。",
  SPENT: "取り尽くされている。少し待てば戻る。",
  WRONG_STATION: "ここでは作れない。",
  NOT_SKILLED: "まだ腕が足りない。",
  MISSING_INPUTS: "材料が足りない。",
  TOO_MANY_ORDERS: "頼めるのは三つまで。先に受け取ろう。",
  NOT_READY: "まだできていない。",
  NOT_WANTED: "もう十分ある。今は買い取れない、と言われた。",
  NO_ERRAND: "今日はもう頼まれていない。",
  TOO_MANY_ERRANDS: "頼まれごとは一度に三つまで。",
  FALLEN: "倒れていて動けない。",
  NOT_FALLEN: "倒れてはいない。",
  TAKEN: "ほかの人が戦っている。",
  STORAGE_FULL: "倉庫に空きがない。",
  NOT_STORABLE: "それは預けられない。",
  NOT_TRADABLE: "それは渡せない。",
  COOLDOWN: "まだ使えない。",
  SP_SHORT: "SP が足りない。",
}
