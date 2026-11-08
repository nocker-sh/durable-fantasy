import { expect, it } from "vitest"
import { gatheringTool } from "#/world/core/gathering-tool"
import { apply } from "#/world/core/apply"
import { NODES } from "#/world/core/gather"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"

const tree = NODES.find((node) => node.kind === "tree")!
it.each([0, 1, 2] as const)("wears only the selected axe when bag quality is %s", (q) => {
  const bag = [...bagWith(["wood-axe", 1])]
  bag[0] = { item: "wood-axe", count: 1, q, dur: 10 }
  const state = player({ bag, equipment: { ...player().equipment, weapon: "wood-axe" }, worn: { weapon: { q: 1, dur: 20 } } })
  expect(gatheringTool(state, "woodcutting")?.source).toBe(q > 1 ? "bag" : "weapon")
  const result = apply(state, { type: "gather", node: tree.id, roll: 0.5 })
  if (!result.ok) throw Error(result.reason)
  expect(result.state.bag[0]?.dur).toBe(q > 1 ? 9 : 10)
  expect(result.state.worn.weapon?.dur).toBe(q > 1 ? 20 : 19)
  expect(state.bag[0]?.dur).toBe(10)
  expect(state.worn.weapon?.dur).toBe(20)
})

it("ignores broken tools and tools for other skills", () => {
  const bag = [...bagWith(["wood-axe", 1], ["sickle", 1])]
  bag[0] = { item: "wood-axe", count: 1, q: 3, dur: 0 }
  const state = player({ bag, equipment: { ...player().equipment, weapon: "wood-axe" }, worn: { weapon: { dur: 0 } } })
  expect(gatheringTool(state, "woodcutting")).toBeNull()
  expect(gatheringTool(state, "foraging")).toMatchObject({ source: "bag", index: 1, stack: { item: "sickle" } })
})
