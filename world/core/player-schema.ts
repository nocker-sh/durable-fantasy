import { z } from "zod"
import type { ItemId } from "#/world/core/items/catalog"
import { isItemId } from "#/world/core/items/is-item-id"
import { NAME_MAX, HOTBAR_SIZE, LOOK_COUNT, NECK_KINDS, NECK_RAMPS, MAX_STAMINA } from "#/world/core/player-rules"
import { BAG_SIZE } from "#/world/core/bag-rules"
import type { HotbarEntry } from "#/world/core/player-types"
import { skillOfKey } from "#/world/core/skill-of-key"
import { SLOTS } from "#/world/core/items/kinds"
import { commissionOrderSchema } from "#/world/core/commission-order-schema"
import { STORAGE_SIZE } from "#/world/core/storage/rules"
import { emptyStorage } from "#/world/core/storage/empty-storage"
import { MAX_LEVEL } from "#/world/core/growth-rules"
import { emptyLife } from "#/world/core/empty-life"

/** an item id, checked against the item table */
export const itemId = z.custom<ItemId>((value) => typeof value === "string" && isItemId(value), "unknown item")

const count = z.number().int().min(0)

const stat = z.number().int().min(1).max(99)

export const stackSchema = z.object({
  item: itemId,
  count: count.min(1),
  q: z.literal([0, 1, 2, 3]).optional(),
  by: z.string().max(NAME_MAX).optional(),
  dur: count.optional(),
})

const bagSchema = z.array(stackSchema.nullable()).length(BAG_SIZE)

export const hotbarEntry = z.custom<HotbarEntry>((value) => typeof value === "string" && (isItemId(value) || skillOfKey(value) !== null), "unknown item or skill")

const hotbarSchema = z.array(hotbarEntry.nullable()).length(HOTBAR_SIZE)

export const nameSchema = z.string().trim().min(1).max(NAME_MAX)

/** New names are normalized; old saves retain their original spelling. */
export const profileNameSchema = z
  .string()
  .max(128)
  .transform((value) => value.normalize("NFC").trim())
  .pipe(
    z
      .string()
      .min(1)
      .max(NAME_MAX)
      .refine((value) => !/[\p{Cc}\p{Cf}\p{Cs}]/u.test(value), "名前に制御文字は使えません"),
  )

const quality = z.literal([0, 1, 2, 3])

const wornSchema = z.object({ q: quality.optional(), by: z.string().max(NAME_MAX).optional(), dur: count.optional() })

const lifeSchema = z.object({
  woodcutting: count.default(0),
  fishing: count.default(0),
  foraging: count.default(0),
  cooking: count.default(0),
  alchemy: count.default(0),
  carpentry: count.default(0),
  smithing: count.default(0),
  tailoring: count.default(0),
})
const equipmentSchema = z.object({
  head: itemId.nullable().default(null),
  neck: itemId.nullable().default(null),
  body: itemId.nullable().default(null),
  weapon: itemId.nullable().default(null),
  shield: itemId.nullable().default(null),
  feet: itemId.nullable().default(null),
  accessory1: itemId.nullable().default(null),
  accessory2: itemId.nullable().default(null),
})

/** What the third shape and the second share. */
const common = {
  revision: count.default(0),
  name: nameSchema,
  profileComplete: z.boolean().default(true),
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
  focusAt: count.default(0),
  focusUntil: count.default(0),
  orders: z.array(commissionOrderSchema).default([]),
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
export const v2Schema = z.object({
  ...common,
  version: z.literal(2),
  level: z.number().int().min(1).max(99),
  skills: z.record(z.string(), count).default({}),
  hotbar: z.array(z.string().nullable()).length(HOTBAR_SIZE),
})

/** The first saved shape: gold, HP, bag, one weapon and the hotbar. */
export const v1Schema = z.object({
  version: z.literal(1),
  gold: count,
  hp: count,
  bag: bagSchema,
  weapon: itemId.nullable(),
  hotbar: hotbarSchema,
})
