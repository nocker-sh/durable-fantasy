import { expect, it } from "vitest"
import { apply } from "./apply"
import { RECIPES } from "#/world/core/recipes/catalog"
import { ITEMS } from "#/world/core/items/catalog"
import { QUALITY_EFFECT } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"
import { LIFE_CAP } from "#/world/core/life-rules"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { loadPlayer } from "#/world/core/load-player"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

it("keeps quality metadata on every consumable recipe", () => {
  for (const r of RECIPES) if (ITEMS[r.output.item].kind === "consumable") expect(ITEMS[r.output.item].made, r.id).toBe(true)
})

it.each(["potion", "blue-potion", "orange-potion"] as const)("preserves brewed %s quality through saving and applies it when consumed", (id) => {
  const recipe = RECIPES.find((r) => r.id === id)!
  const p = player({
    name: "エルナ",
    gold: 100,
    hp: 1,
    sp: 0,
    stats: { ...player().stats, vit: 40, mnd: 40 },
    life: { ...player().life, alchemy: lifeExpAt(LIFE_CAP) },
    bag: bagWith(...recipe.inputs.map((i) => [i.item, i.count] as [ItemId, number])),
  })
  const made = apply(p, { type: "craft", recipe: id, station: "workshop-hearth", roll: 0.2 })
  if (!made.ok) throw Error(made.reason)
  const saved = loadPlayer(JSON.parse(JSON.stringify(made.state)))
  const slot = saved.bag.findIndex((s) => s?.item === id)
  expect(saved.bag[slot]).toMatchObject({ by: "エルナ", q: 2 })
  const used = apply(saved, { type: "use", slot })
  if (!used.ok) throw Error(used.reason)
  const effect = ITEMS[id].use!
  expect(used.state.hp - saved.hp).toBe(Math.round((effect.hp ?? 0) * QUALITY_EFFECT[2]))
  expect(used.state.sp - saved.sp).toBe(Math.round((effect.sp ?? 0) * QUALITY_EFFECT[2]))
})

it.each(["blue-potion", "orange-potion"] as const)("still uses an unmarked saved %s at normal potency", (id) => {
  const p = player({ hp: 1, sp: 0, stats: { ...player().stats, vit: 40, mnd: 40 }, bag: bagWith([id, 1]) })
  const used = apply(loadPlayer(JSON.parse(JSON.stringify(p))), { type: "use", slot: 0 })
  if (!used.ok) throw Error(used.reason)
  expect(used.state.hp - p.hp).toBe(ITEMS[id].use!.hp ?? 0)
  expect(used.state.sp - p.sp).toBe(ITEMS[id].use!.sp ?? 0)
})
