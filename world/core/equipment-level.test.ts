import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { ITEMS } from "#/world/core/items/catalog"
import { METAL_RULES } from "#/world/core/items/weapon-metals"
import { MAX_LEVEL } from "#/world/core/growth-rules"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

const strong = { vit: 40, mnd: 40, str: 40, dex: 40, int: 40, fth: 40 }

it("asks a higher character level for each better metal, within the level cap", () => {
  expect(ITEMS["iron-longsword"].equip?.level).toBeUndefined()
  expect(ITEMS["steel-longsword"].equip?.level).toBe(METAL_RULES.steel.level)
  expect(ITEMS["engine-longsword"].equip?.level).toBe(METAL_RULES.engine.level)
  expect(METAL_RULES.iron.level).toBeLessThan(METAL_RULES.steel.level)
  expect(METAL_RULES.steel.level).toBeLessThan(METAL_RULES.engine.level)
  expect(METAL_RULES.engine.level).toBeLessThanOrEqual(MAX_LEVEL)
})

it.each(["steel-longsword", "engine-longsword"] as const)("refuses %s below its level however strong the arm", (item) => {
  const needed = ITEMS[item].equip?.level ?? 1
  const low = player({ level: needed - 1, stats: strong, bag: bagWith([item, 1]) })
  expect(apply(low, { type: "equip", slot: 0 })).toEqual({ ok: false, reason: "LEVEL_TOO_LOW" })
  expect(apply({ ...low, level: needed }, { type: "equip", slot: 0 }).ok).toBe(true)
})
