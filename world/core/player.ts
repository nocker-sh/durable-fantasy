// One player's saved data (game-system.md §13). The server keeps this per player and is the
// only one that changes it; the client gets copies back.
import { z } from "zod"
import { BAG_SIZE, addItem, emptyBag, type Bag } from "./bag.ts"
import { MAX_LEVEL, STARTING_POINTS, pointsForLevel, startingStats, type Stats } from "./growth.ts"
import { ITEMS, SLOTS, isItemId, type ItemId, type Quality, type Slot } from "./items.ts"
import { derive, unmet } from "./stats.ts"
import { LIFE_SKILLS, emptyLife, lifeFromProficiency, type LifeExp } from "./life.ts"
import type { Order } from "./commissions.ts"
import type { Taken } from "./errands.ts"
import { STORAGE_SIZE, emptyStorage } from "./storage.ts"
import { skillKey, skillOfKey, type SkillKey } from "./skills.ts"
import type { Thread } from "./threads.ts"

export const HOTBAR_SIZE = 10
export const NAME_MAX = 16
/** looks a player can pick from (travellers.ts LOOKS) */
export const LOOK_COUNT = 8

export interface SavePoint {
  readonly map: string
  readonly cell: readonly [number, number]
}

export interface PlayerState {
  readonly version: 3
  readonly name: string
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
  /** experience in each life skill; the levels follow from it (core/life.ts, game-system.md §9.1) */
  readonly life: LifeExp
  /** work left with resident craftsmen (economy.md §3) */
  readonly orders: readonly Order[]
  /** how well each resident knows them, 0–100 (economy.md §6) */
  readonly friends: Readonly<Record<string, number>>
  /** errands taken today (core/errands.ts) */
  readonly errands: readonly Taken[]
  /** the day they last bought from each resident (friendship from buying comes once a day) */
  readonly boughtOn: Readonly<Record<string, string>>
  readonly bag: Bag
  /** what is left with the town warehouse (core/storage.ts) */
  readonly storage: Bag
  /** the party they are in (core/party.ts), if any */
  readonly party: string | null
  /** threads swapped with friends (core/threads.ts) */
  readonly threads: readonly Thread[]
  readonly equipment: Readonly<Record<Slot, ItemId | null>>
  /** what a worn thing carries with it: its quality, maker and wear (core/bag.ts Stack) */
  readonly worn: Readonly<Partial<Record<Slot, Worn>>>
  /** Items bound to the number keys 1-0. */
  readonly hotbar: readonly (HotbarEntry | null)[]
  /** where the player comes back after dying */
  readonly savePoint: SavePoint
}

export interface Worn {
  readonly q?: Quality
  readonly by?: string
  readonly dur?: number
}

export const NECK_KINDS = ["muffler", "stole", "scarf"] as const
export type NeckKind = (typeof NECK_KINDS)[number]
/** colours a neck wrap can be dyed (the cloth ramps in scene/pix.ts) */
export const NECK_RAMPS = ["cRed", "cWine", "cMustard", "cHoney", "cGreen", "cMint", "cBlue", "cSky", "cPlum", "cBrown", "cCream", "cGray"] as const

export const STARTING_GOLD = 200
export const MAX_STAMINA = 100
/** fullness falls by one every this many ms */
export const DIGEST_MS = 3 * 60_000

/** How full they are now. */
export const fullNow = (p: Pick<PlayerState, "full" | "fullAt">, now: number) => Math.max(0, p.full - Math.floor(Math.max(0, now - p.fullAt) / DIGEST_MS))
/** HP and SP come back this often while up and about (more with VIT and INT, twice as much sitting) */
export const REGEN_MS = 20_000

/** What comes back: the most, and how much each while (stats.ts derive). */
export interface Rest {
  maxHp: number
  maxSp: number
  regenHp: number
  regenSp: number
}

/** Bring HP and SP up to date: what has come back since they were last counted. Fallen, nothing does. */
export function settle<P extends Pick<PlayerState, "hp" | "hpAt" | "sp" | "spAt" | "sitting">>(p: P, r: Rest, now: number): P {
  if (p.hp <= 0) return p
  const k = p.sitting ? 2 : 1
  const one = (v: number, at: number, max: number, per: number): [number, number] => {
    // not counted yet (a new traveller, an older save): it starts coming back from now
    if (!at || v >= max) return [Math.min(v, max), now]
    const n = Math.floor(Math.max(0, now - at) / REGEN_MS)
    if (!n) return [v, at]
    const next = Math.min(max, v + n * per * k)
    return [next, next >= max ? now : at + n * REGEN_MS]
  }
  const [hp, hpAt] = one(p.hp, p.hpAt, r.maxHp, r.regenHp)
  const [sp, spAt] = one(p.sp, p.spAt, r.maxSp, r.regenSp)
  if (hp === p.hp && hpAt === p.hpAt && sp === p.sp && spAt === p.spAt) return p
  return { ...p, hp, hpAt, sp, spAt }
}
export const warmNow = (p: Pick<PlayerState, "warmUntil">, now: number) => p.warmUntil > now
export const DEFAULT_NAME = "シグレニ"
export const TOWN_SPAWN: SavePoint = { map: "phanthiet", cell: [38, 80] }

export const emptyEquipment = (): Record<Slot, ItemId | null> => Object.fromEntries(SLOTS.map((s) => [s, null])) as Record<Slot, ItemId | null>

/** A new traveller: tired from the road (60% HP), with a little money and bread. */
export function newPlayer(name = DEFAULT_NAME, look = 0): PlayerState {
  const base = {
    version: 3 as const,
    name,
    look,
    neck: "muffler" as NeckKind,
    neckRamp: "cRed",
    level: 1,
    exp: 0,
    statPoints: STARTING_POINTS,
    stats: startingStats(),
    gold: STARTING_GOLD,
    bag: addItem(emptyBag(), "rye-bread", 2) ?? emptyBag(),
    // a branch picked up on the way: better than nothing against a slime
    equipment: { ...emptyEquipment(), weapon: "wooden-stick" as ItemId },
    hotbar: ["rye-bread" as ItemId, ...Array.from({ length: HOTBAR_SIZE - 1 }, () => null)],
    savePoint: TOWN_SPAWN,
  }
  const d = derive(base)
  return {
    ...base,
    worn: {},
    hp: Math.floor(d.maxHp * 0.6),
    hpAt: 0,
    spAt: 0,
    sitting: false,
    ready: {},
    sp: d.maxSp,
    stamina: 70,
    full: 0,
    fullAt: 0,
    warmUntil: 0,
    life: emptyLife(),
    orders: [],
    friends: {},
    errands: [],
    boughtOn: {},
    storage: emptyStorage(),
    party: null,
    threads: [],
  }
}

/** an item id, checked against the item table */
export const itemId = z.custom<ItemId>((value) => typeof value === "string" && isItemId(value), "unknown item")
const count = z.number().int().min(0)
const stat = z.number().int().min(1).max(99)
const stackSchema = z.object({
  item: itemId,
  count: count.min(1),
  q: z.literal([0, 1, 2, 3] as const).optional(),
  by: z.string().max(NAME_MAX).optional(),
  dur: count.optional(),
})
const bagSchema = z.array(stackSchema.nullable()).length(BAG_SIZE)
/** What can sit on the shortcut bar: an item, or a skill ("skill:first-aid"). */
export type HotbarEntry = ItemId | SkillKey
export const hotbarEntry = z.custom<HotbarEntry>((value) => typeof value === "string" && (isItemId(value) || skillOfKey(value) !== null), "unknown item or skill")
const hotbarSchema = z.array(hotbarEntry.nullable()).length(HOTBAR_SIZE)

export const nameSchema = z.string().trim().min(1).max(NAME_MAX)

const quality = z.literal([0, 1, 2, 3] as const)
const wornSchema = z.object({ q: quality.optional(), by: z.string().max(NAME_MAX).optional(), dur: count.optional() })
const lifeSchema = z.object(Object.fromEntries(LIFE_SKILLS.map((s) => [s, count.default(0)])) as unknown as Record<(typeof LIFE_SKILLS)[number], z.ZodDefault<typeof count>>)
const equipmentSchema = z.object(Object.fromEntries(SLOTS.map((s) => [s, itemId.nullable().default(null)])) as unknown as Record<Slot, z.ZodDefault<z.ZodNullable<typeof itemId>>>)

/** What the third shape and the second share. */
const common = {
  name: nameSchema,
  look: z
    .number()
    .int()
    .min(0)
    .max(LOOK_COUNT - 1),
  neck: z.enum(NECK_KINDS).default("muffler"),
  neckRamp: z.enum(NECK_RAMPS).default("cRed"),
  exp: count,
  statPoints: count,
  gold: count,
  hp: count,
  hpAt: count.default(0),
  spAt: count.default(0),
  sitting: z.boolean().default(false),
  ready: z.record(z.string().max(30), count).default({}),
  sp: count,
  stamina: count.max(MAX_STAMINA).default(MAX_STAMINA),
  full: count.max(100).default(0),
  fullAt: count.default(0),
  warmUntil: count.default(0),
  orders: z.array(z.object({ commission: z.string().max(40), readyAt: count, q: quality })).default([]),
  friends: z.record(z.string().max(20), count.max(100)).default({}),
  errands: z.array(z.object({ id: z.string().max(40), day: z.string().max(10), done: z.boolean() })).default([]),
  boughtOn: z.record(z.string().max(20), z.string().max(10)).default({}),
  bag: bagSchema,
  party: z.string().max(64).nullable().default(null),
  threads: z.array(z.object({ key: z.string().max(32), name: nameSchema, town: count.min(1).max(99), at: count })).default([]),
  storage: z
    .array(stackSchema.nullable())
    .length(STORAGE_SIZE)
    .default(() => [...emptyStorage()]),
  // slots added later (neck) read as empty from older saves
  equipment: equipmentSchema,
  savePoint: z.object({ map: z.string(), cell: z.tuple([count, count]) }),
}

export const playerStateSchema = z.object({
  ...common,
  version: z.literal(3),
  level: z.number().int().min(1).max(MAX_LEVEL),
  stats: z.object({ vit: stat, mnd: stat, str: stat, dex: stat, int: stat, fth: stat }),
  life: lifeSchema.default(emptyLife),
  worn: z.partialRecord(z.enum(SLOTS), wornSchema).default({}),
  hotbar: hotbarSchema,
})

/** The second shape: a job and its level, skill points, six other stats, proficiency 0–200. */
const v2Schema = z.object({
  ...common,
  version: z.literal(2),
  level: z.number().int().min(1).max(99),
  skills: z.record(z.string(), count).default({}),
  hotbar: z.array(z.string().nullable()).length(HOTBAR_SIZE),
})

/** The first saved shape: gold, HP, bag, one weapon and the hotbar. */
const v1Schema = z.object({
  version: z.literal(1),
  gold: count,
  hp: count,
  bag: bagSchema,
  weapon: itemId.nullable(),
  hotbar: hotbarSchema,
})

/**
 * Move a second-shape save forward: the level kept (to the current cap), stats begun again with the points
 * that level brings, proficiency as life skill levels, the basic skill as sitting. What can no
 * longer be worn goes back to the bag if it fits.
 */
function fromV2(o: z.infer<typeof v2Schema>): PlayerState {
  const level = Math.min(o.level, MAX_LEVEL)
  let points = STARTING_POINTS
  for (let l = 2; l <= level; l++) points += pointsForLevel(l)
  const hotbar = o.hotbar.map((h) => (h === "skill:basic" ? skillKey("sit") : h && (isItemId(h) || skillOfKey(h)) ? (h as HotbarEntry) : null))
  const { skills, hotbar: _hotbar, version: _version, ...rest } = o
  let p: PlayerState = {
    ...newPlayer(o.name, o.look),
    ...rest,
    version: 3,
    level,
    exp: level >= MAX_LEVEL ? 0 : o.exp,
    stats: startingStats(),
    statPoints: points,
    life: lifeFromProficiency(skills),
    worn: {},
    hotbar,
    ready: {},
  }
  for (const slot of SLOTS) {
    const id = p.equipment[slot]
    if (!id || !unmet(ITEMS[id].equip?.needs, p).length) continue
    const bag = addItem(p.bag, id, 1)
    if (bag) p = { ...p, bag, equipment: { ...p.equipment, [slot]: null } }
  }
  const d = derive(p)
  return { ...p, hp: Math.min(p.hp, d.maxHp), sp: Math.min(p.sp, d.maxSp) }
}

/** Read a saved state, moving older shapes forward; anything unreadable starts over. */
export function loadPlayer(saved: unknown): PlayerState {
  const current = playerStateSchema.safeParse(saved)
  if (current.success) return current.data as PlayerState
  const two = v2Schema.safeParse(saved)
  if (two.success) return fromV2(two.data)
  const old = v1Schema.safeParse(saved)
  if (old.success) {
    const fresh = newPlayer()
    const equipment = { ...emptyEquipment(), weapon: old.data.weapon }
    const maxHp = derive({ ...fresh, equipment }).maxHp
    return { ...fresh, gold: old.data.gold, bag: old.data.bag, hotbar: old.data.hotbar, equipment, hp: Math.min(old.data.hp, maxHp) }
  }
  return newPlayer()
}

/** The neck wrap others see: a worn one, or else the one chosen in the character screen. */
export function wornNeck(p: Pick<PlayerState, "equipment" | "neck" | "neckRamp">): { neck: NeckKind; neckRamp: string; neckStripe?: string } {
  const worn = p.equipment.neck ? ITEMS[p.equipment.neck].equip?.look : undefined
  return worn ?? { neck: p.neck, neckRamp: p.neckRamp }
}
