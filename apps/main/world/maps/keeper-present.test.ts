import { expect, it } from "vitest"
import { keeperPresent } from "#/world/maps/keeper-present"

const at = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3))

it("a keeper eating supper at a neighbour's stall is not minding their own", () => {
  expect(keeperPresent("vegetables", "グレーテ", at("01:00"))).toBe(true)
  expect(keeperPresent("vegetables", "グレーテ", at("01:45"))).toBe(false)
  expect(keeperPresent("vegetables", "グレーテ", at("02:45"))).toBe(true)
})

it("the monk walking the graveyard is not at the chapel door", () => {
  expect(keeperPresent("chapel", "ベネディクト", at("02:30"))).toBe(true)
  expect(keeperPresent("chapel", "ベネディクト", at("03:30"))).toBe(false)
  expect(keeperPresent("chapel", "ベネディクト", at("04:30"))).toBe(true)
})
