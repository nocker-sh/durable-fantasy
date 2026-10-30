import { expect, it } from "vitest"
import { RECIPES } from "#/world/core/recipes/catalog"
import { NODES } from "#/world/core/gather"
import { LIFE_CAP } from "#/world/core/life-rules"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { SHOPS } from "#/world/core/shops"
import { apply } from "./apply"
import { countItem } from "#/world/core/count-item"
import { player } from "#/world/test/player"

it("provides an obtainable source for every current recipe ingredient", () => {
  const reachable = new Set<string>(Object.values(SHOPS).flatMap((s) => [...s.stock]))
  for (const node of NODES) for (const y of node.yields) if ((y.level ?? 0) <= LIFE_CAP && y.weight > 0) reachable.add(y.item)
  for (const spawn of SPAWNS) for (const drop of MONSTER_KINDS[spawn.kind].drops) if (drop.chance > 0) reachable.add(drop.item)
  const recipes = RECIPES.filter((r) => r.min <= LIFE_CAP)
  let previous = -1
  while (previous !== reachable.size) {
    previous = reachable.size
    for (const recipe of recipes) if (recipe.inputs.every((input) => reachable.has(input.item))) reachable.add(recipe.output.item)
  }
  const missing = recipes.flatMap((recipe) => recipe.inputs.filter((input) => !reachable.has(input.item)).map((input) => `${recipe.id}: ${input.item}`))
  expect(missing).toEqual([])
})

it("buys the shepherd's fleece from the tailor and spins it into a wearable muffler", () => {
  let state = player({ gold: 200, life: { ...player().life, tailoring: lifeExpAt(2) } })
  const bought = apply(state, { type: "buy", shop: "tailor", item: "white-fleece", count: 2 })
  if (!bought.ok) throw Error(bought.reason)
  state = bought.state
  for (const recipe of ["yarn", "yarn", "wool-muffler"]) {
    const made = apply(state, { type: "craft", recipe, station: "workshop-loom", roll: 0.5 })
    if (!made.ok) throw Error(made.reason)
    state = made.state
  }
  expect(countItem(state.bag, "white-fleece")).toBe(0)
  expect(countItem(state.bag, "yarn")).toBe(1)
  const slot = state.bag.findIndex((s) => s?.item === "wool-muffler")
  const equipped = apply(state, { type: "equip", slot })
  if (!equipped.ok) throw Error(equipped.reason)
  expect(equipped.state.equipment.neck).toBe("wool-muffler")
  expect(equipped.state.gold).toBeLessThan(200)
})
