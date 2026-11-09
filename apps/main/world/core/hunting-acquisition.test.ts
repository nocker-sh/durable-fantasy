import { expect, it } from "vitest"
import type { Stats } from "#/world/core/growth-types"
import { newPlayer } from "#/world/core/new-player"
import { apply } from "#/world/core/apply"
import { derive } from "#/world/core/derive"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { SHOPS } from "#/world/core/shops"
import { RECIPES } from "#/world/core/recipes/catalog"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { HUNTING_COMMISSIONS } from "#/world/core/hunting-commissions"
import { HUNTING_STAGES } from "#/world/test/hunting-stages"
import { artBlocked } from "#/world/core/art-blocked"
import { loadPlayer } from "#/world/core/load-player"

it.each(["short-sword", "oak-staff"] as const)("starts %s from original funds and stat points, without grants or crafting levels", (weapon) => {
  const run = { state: newPlayer() }
  const needs: Partial<Stats> = weapon === "short-sword" ? { str: 8, dex: 7 } : { mnd: 7, int: 9 }
  for (const stat of ["str", "dex", "mnd", "int"] as const) {
    const target = needs[stat] ?? 5
    while (run.state.stats[stat] < target) {
      const raised = apply(run.state, { type: "raise", stat })
      if (!raised.ok) throw Error(raised.reason)
      run.state = raised.state
    }
  }
  const bought = apply(run.state, { type: "buy", shop: weapon === "short-sword" ? "smithy" : "woodworker", item: weapon, count: 1 })
  if (!bought.ok) throw Error(bought.reason)
  expect(bought.state.gold).toBeLessThan(run.state.gold)
  const slot = bought.state.bag.findIndex((entry) => entry?.item === weapon)
  const equipped = apply(bought.state, { type: "equip", slot })
  if (!equipped.ok) throw Error(equipped.reason)
  expect(artBlocked(weapon === "short-sword" ? "lunge" : "ember", equipped.state)).toBeNull()
  expect(loadPlayer(structuredClone(equipped.state)).equipment.weapon).toBe(weapon)
  expect(derive(equipped.state).maxSp).toBeGreaterThan(0)
})

/** Search actual purchase, drop, and currently unlocked crafting paths; cycles or later milestones fail. */
function obtainable(item: ItemId, seen: readonly ItemId[] = []): boolean {
  if (seen.includes(item) || (ITEMS[item].milestone ?? 0) > 8) return false
  if (Object.values(SHOPS).some((shop) => (shop.stock as readonly ItemId[]).includes(item))) return true
  if (SPAWNS.some((spawn) => MONSTER_KINDS[spawn.kind].drops.some((drop) => drop.item === item && drop.chance > 0))) return true
  return RECIPES.some((recipe) => recipe.output.item === item && recipe.min <= 8 && recipe.inputs.every((input) => obtainable(input.item, [...seen, item])))
}

it.each(HUNTING_COMMISSIONS)("connects every input of $output.item to an available shop, creature or unlocked recipe", (job) => {
  for (const input of job.inputs) expect(obtainable(input.item), input.item).toBe(true)
})

it.each(HUNTING_STAGES.filter((stage) => stage.level > 12))("keeps the level and ability gates on $weapon while permitting its intended build", (stage) => {
  const state = { ...newPlayer(), level: stage.level, stats: stage.stats, bag: newPlayer().bag.map((entry, index) => (index === 0 ? { item: stage.weapon, count: 1 } : entry)) }
  const rejected = apply({ ...state, level: 1 }, { type: "equip", slot: 0 })
  expect(rejected).toEqual({ ok: false, reason: "LEVEL_TOO_LOW" })
  expect(apply(state, { type: "equip", slot: 0 }).ok).toBe(true)
})
