import { expect, it } from "vitest"
import { unmet } from "#/world/core/unmet"
import { player } from "#/world/test/player"

it("keeps authored requirement order and uses raised stats instead of equipment bonuses", () => {
  const base = player()
  const owner = player({ stats: { vit: 5, mnd: 5, str: 5, dex: 5, int: 5, fth: 5 }, equipment: { ...base.equipment, accessory1: "fang-charm" } })
  expect(unmet({ woodcutting: 4, str: 8 }, owner)).toEqual([
    ["woodcutting", 4, 0],
    ["str", 8, 5],
  ])
  expect(unmet({ str: 5, dex: undefined }, owner)).toEqual([])
})
it("detects unknown requirement names instead of treating a malformed definition as equippable", () => {
  const needs = Object.assign({ str: 1 }, { unknown: 10 })
  expect(() => unmet(needs, player())).toThrow("Unknown equipment requirement")
})
