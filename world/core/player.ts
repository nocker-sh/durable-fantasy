// One player's saved data (game-system.md §13). The server keeps this per player and is the
// only one that changes it; the client gets copies back.
import * as v from "valibot";
import { BAG_SIZE, addItem, emptyBag, type Bag } from "./bag.ts";
import { MAX_LEVEL, STARTING_POINTS, pointsForLevel, startingStats, type Stats } from "./growth.ts";
import { ITEMS, SLOTS, isItemId, type ItemId, type Quality, type Slot } from "./items.ts";
import { derive, unmet } from "./stats.ts";
import { LIFE_SKILLS, emptyLife, lifeFromProficiency, type LifeExp } from "./life.ts";
import type { Order } from "./commissions.ts";
import type { Taken } from "./errands.ts";
import { STORAGE_SIZE, emptyStorage } from "./storage.ts";
import { skillKey, skillOfKey, type SkillKey } from "./skills.ts";
import type { Thread } from "./threads.ts";

export const HOTBAR_SIZE = 10;
export const NAME_MAX = 16;
/** looks a player can pick from (travellers.ts LOOKS) */
export const LOOK_COUNT = 8;

export interface SavePoint {
  readonly map: string;
  readonly cell: readonly [number, number];
}

export interface PlayerState {
  readonly version: 3;
  readonly name: string;
  /** index into the look presets */
  readonly look: number;
  /** what they wrap round the neck, and its colour (everyone wears one) */
  readonly neck: NeckKind;
  readonly neckRamp: string;
  readonly level: number;
  readonly exp: number;
  readonly statPoints: number;
  readonly stats: Stats;
  readonly gold: number;
  readonly hp: number;
  /** when HP last came back by a point (it recovers slowly while up; 0 HP is fallen and stays so) */
  readonly hpAt: number;
  /** when SP last came back */
  readonly spAt: number;
  /** sitting to rest: HP and SP come back twice as fast (core/skills.ts "sit") */
  readonly sitting: boolean;
  /** when each skill can be used again (ms) */
  readonly ready: Readonly<Record<string, number>>;
  readonly sp: number;
  /** 0–100: spent on gathering, making, fighting and the road out of town (game-system.md §3.6) */
  readonly stamina: number;
  /** how full they are (0–100) as of `fullAt`; it goes down by one every three minutes */
  readonly full: number;
  readonly fullAt: number;
  /** warm until this time (ms) */
  readonly warmUntil: number;
  /** experience in each life skill; the levels follow from it (core/life.ts, game-system.md §9.1) */
  readonly life: LifeExp;
  /** work left with resident craftsmen (economy.md §3) */
  readonly orders: readonly Order[];
  /** how well each resident knows them, 0–100 (economy.md §6) */
  readonly friends: Readonly<Record<string, number>>;
  /** errands taken today (core/errands.ts) */
  readonly errands: readonly Taken[];
  /** the day they last bought from each resident (friendship from buying comes once a day) */
  readonly boughtOn: Readonly<Record<string, string>>;
  readonly bag: Bag;
  /** what is left with the town warehouse (core/storage.ts) */
  readonly storage: Bag;
  /** the party they are in (core/party.ts), if any */
  readonly party: string | null;
  /** threads swapped with friends (core/threads.ts) */
  readonly threads: readonly Thread[];
  readonly equipment: Readonly<Record<Slot, ItemId | null>>;
  /** what a worn thing carries with it: its quality, maker and wear (core/bag.ts Stack) */
  readonly worn: Readonly<Partial<Record<Slot, Worn>>>;
  /** Items bound to the number keys 1-0. */
  readonly hotbar: readonly (HotbarEntry | null)[];
  /** where the player comes back after dying */
  readonly savePoint: SavePoint;
}

export interface Worn {
  readonly q?: Quality;
  readonly by?: string;
  readonly dur?: number;
}

export const NECK_KINDS = ["muffler", "stole", "scarf"] as const;
export type NeckKind = (typeof NECK_KINDS)[number];
/** colours a neck wrap can be dyed (the cloth ramps in scene/pix.ts) */
export const NECK_RAMPS = ["cRed", "cWine", "cMustard", "cHoney", "cGreen", "cMint", "cBlue", "cSky", "cPlum", "cBrown", "cCream", "cGray"] as const;

export const STARTING_GOLD = 200;
export const MAX_STAMINA = 100;
/** fullness falls by one every this many ms */
export const DIGEST_MS = 3 * 60_000;

/** How full they are now. */
export const fullNow = (p: Pick<PlayerState, "full" | "fullAt">, now: number) => Math.max(0, p.full - Math.floor(Math.max(0, now - p.fullAt) / DIGEST_MS));
/** HP and SP come back this often while up and about (more with VIT and INT, twice as much sitting) */
export const REGEN_MS = 20_000;

/** What comes back: the most, and how much each while (stats.ts derive). */
export interface Rest {
  maxHp: number;
  maxSp: number;
  regenHp: number;
  regenSp: number;
}

/** Bring HP and SP up to date: what has come back since they were last counted. Fallen, nothing does. */
export function settle<P extends Pick<PlayerState, "hp" | "hpAt" | "sp" | "spAt" | "sitting">>(p: P, r: Rest, now: number): P {
  if (p.hp <= 0) return p;
  const k = p.sitting ? 2 : 1;
  const one = (v: number, at: number, max: number, per: number): [number, number] => {
    // not counted yet (a new traveller, an older save): it starts coming back from now
    if (!at || v >= max) return [Math.min(v, max), now];
    const n = Math.floor(Math.max(0, now - at) / REGEN_MS);
    if (!n) return [v, at];
    const next = Math.min(max, v + n * per * k);
    return [next, next >= max ? now : at + n * REGEN_MS];
  };
  const [hp, hpAt] = one(p.hp, p.hpAt, r.maxHp, r.regenHp);
  const [sp, spAt] = one(p.sp, p.spAt, r.maxSp, r.regenSp);
  if (hp === p.hp && hpAt === p.hpAt && sp === p.sp && spAt === p.spAt) return p;
  return { ...p, hp, hpAt, sp, spAt };
}
export const warmNow = (p: Pick<PlayerState, "warmUntil">, now: number) => p.warmUntil > now;
export const DEFAULT_NAME = "シグレニ";
export const TOWN_SPAWN: SavePoint = { map: "phanthiet", cell: [38, 80] };

export const emptyEquipment = (): Record<Slot, ItemId | null> => Object.fromEntries(SLOTS.map((s) => [s, null])) as Record<Slot, ItemId | null>;

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
  };
  const d = derive(base);
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
  };
}

/** an item id, checked against the item table */
export const itemId = v.custom<ItemId>((value) => typeof value === "string" && isItemId(value), "unknown item");
const count = v.pipe(v.number(), v.integer(), v.minValue(0));
const stat = v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(99));
const stackSchema = v.object({
  item: itemId,
  count: v.pipe(count, v.minValue(1)),
  q: v.optional(v.picklist([0, 1, 2, 3] as const)),
  by: v.optional(v.pipe(v.string(), v.maxLength(NAME_MAX))),
  dur: v.optional(count),
});
const bagSchema = v.pipe(v.array(v.nullable(stackSchema)), v.length(BAG_SIZE));
/** What can sit on the shortcut bar: an item, or a skill ("skill:first-aid"). */
export type HotbarEntry = ItemId | SkillKey;
export const hotbarEntry = v.custom<HotbarEntry>((value) => typeof value === "string" && (isItemId(value) || skillOfKey(value) !== null), "unknown item or skill");
const hotbarSchema = v.pipe(v.array(v.nullable(hotbarEntry)), v.length(HOTBAR_SIZE));

export const nameSchema = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(NAME_MAX));

const quality = v.picklist([0, 1, 2, 3] as const);
const wornSchema = v.object({ q: v.optional(quality), by: v.optional(v.pipe(v.string(), v.maxLength(NAME_MAX))), dur: v.optional(count) });
const lifeSchema = v.object(Object.fromEntries(LIFE_SKILLS.map((s) => [s, v.optional(count, 0)])) as unknown as Record<(typeof LIFE_SKILLS)[number], v.OptionalSchema<typeof count, 0>>);
const equipmentSchema = v.object(Object.fromEntries(SLOTS.map((s) => [s, v.optional(v.nullable(itemId), null)])) as unknown as Record<Slot, v.NullableSchema<typeof itemId, undefined>>);

/** What the third shape and the second share. */
const common = {
  name: nameSchema,
  look: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(LOOK_COUNT - 1)),
  neck: v.optional(v.picklist(NECK_KINDS), "muffler"),
  neckRamp: v.optional(v.picklist(NECK_RAMPS), "cRed"),
  exp: count,
  statPoints: count,
  gold: count,
  hp: count,
  hpAt: v.optional(count, 0),
  spAt: v.optional(count, 0),
  sitting: v.optional(v.boolean(), false),
  ready: v.optional(v.record(v.pipe(v.string(), v.maxLength(30)), count), {}),
  sp: count,
  stamina: v.optional(v.pipe(count, v.maxValue(MAX_STAMINA)), MAX_STAMINA),
  full: v.optional(v.pipe(count, v.maxValue(100)), 0),
  fullAt: v.optional(count, 0),
  warmUntil: v.optional(count, 0),
  orders: v.optional(v.array(v.object({ commission: v.pipe(v.string(), v.maxLength(40)), readyAt: count, q: quality })), []),
  friends: v.optional(v.record(v.pipe(v.string(), v.maxLength(20)), v.pipe(count, v.maxValue(100))), {}),
  errands: v.optional(v.array(v.object({ id: v.pipe(v.string(), v.maxLength(40)), day: v.pipe(v.string(), v.maxLength(10)), done: v.boolean() })), []),
  boughtOn: v.optional(v.record(v.pipe(v.string(), v.maxLength(20)), v.pipe(v.string(), v.maxLength(10))), {}),
  bag: bagSchema,
  party: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(64))), null),
  threads: v.optional(v.array(v.object({ key: v.pipe(v.string(), v.maxLength(32)), name: nameSchema, town: v.pipe(count, v.minValue(1), v.maxValue(99)), at: count })), []),
  storage: v.optional(v.pipe(v.array(v.nullable(stackSchema)), v.length(STORAGE_SIZE)), emptyStorage),
  // slots added later (neck) read as empty from older saves
  equipment: equipmentSchema,
  savePoint: v.object({ map: v.string(), cell: v.tuple([count, count]) }),
};

export const playerStateSchema = v.object({
  ...common,
  version: v.literal(3),
  level: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_LEVEL)),
  stats: v.object({ vit: stat, mnd: stat, str: stat, dex: stat, int: stat, fth: stat }),
  life: v.optional(lifeSchema, emptyLife),
  worn: v.optional(v.record(v.picklist(SLOTS), wornSchema), {}),
  hotbar: hotbarSchema,
});

/** The second shape: a job and its level, skill points, six other stats, proficiency 0–200. */
const v2Schema = v.object({
  ...common,
  version: v.literal(2),
  level: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(99)),
  skills: v.optional(v.record(v.string(), count), {}),
  hotbar: v.pipe(v.array(v.nullable(v.string())), v.length(HOTBAR_SIZE)),
});

/** The first saved shape: gold, HP, bag, one weapon and the hotbar. */
const v1Schema = v.object({
  version: v.literal(1),
  gold: count,
  hp: count,
  bag: bagSchema,
  weapon: v.nullable(itemId),
  hotbar: hotbarSchema,
});

/**
 * Move a second-shape save forward: the level kept (to 16), stats begun again with the points
 * that level brings, proficiency as life skill levels, the basic skill as sitting. What can no
 * longer be worn goes back to the bag if it fits.
 */
function fromV2(o: v.InferOutput<typeof v2Schema>): PlayerState {
  const level = Math.min(o.level, MAX_LEVEL);
  let points = STARTING_POINTS;
  for (let l = 2; l <= level; l++) points += pointsForLevel(l);
  const hotbar = o.hotbar.map((h) => (h === "skill:basic" ? skillKey("sit") : h && (isItemId(h) || skillOfKey(h)) ? (h as HotbarEntry) : null));
  const { skills, hotbar: _hotbar, version: _version, ...rest } = o;
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
  };
  for (const slot of SLOTS) {
    const id = p.equipment[slot];
    if (!id || !unmet(ITEMS[id].equip?.needs, p).length) continue;
    const bag = addItem(p.bag, id, 1);
    if (bag) p = { ...p, bag, equipment: { ...p.equipment, [slot]: null } };
  }
  const d = derive(p);
  return { ...p, hp: Math.min(p.hp, d.maxHp), sp: Math.min(p.sp, d.maxSp) };
}

/** Read a saved state, moving older shapes forward; anything unreadable starts over. */
export function loadPlayer(saved: unknown): PlayerState {
  const current = v.safeParse(playerStateSchema, saved);
  if (current.success) return current.output as PlayerState;
  const two = v.safeParse(v2Schema, saved);
  if (two.success) return fromV2(two.output);
  const old = v.safeParse(v1Schema, saved);
  if (old.success) {
    const fresh = newPlayer();
    const equipment = { ...emptyEquipment(), weapon: old.output.weapon };
    const maxHp = derive({ ...fresh, equipment }).maxHp;
    return { ...fresh, gold: old.output.gold, bag: old.output.bag, hotbar: old.output.hotbar, equipment, hp: Math.min(old.output.hp, maxHp) };
  }
  return newPlayer();
}

/** The neck wrap others see: a worn one, or else the one chosen in the character screen. */
export function wornNeck(p: Pick<PlayerState, "equipment" | "neck" | "neckRamp">): { neck: NeckKind; neckRamp: string; neckStripe?: string } {
  const worn = p.equipment.neck ? ITEMS[p.equipment.neck].equip?.look : undefined;
  return worn ?? { neck: p.neck, neckRamp: p.neckRamp };
}
