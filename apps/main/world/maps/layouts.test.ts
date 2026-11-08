import { expect, it } from "vitest"
import { layoutOf } from "#/world/maps/layouts"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { HOUSES } from "#/world/town/houses"

it("reuses the completed town layout without duplicating door trails or changing the base", () => {
  const base = structuredClone(SQUARE_LAYOUT)
  const layout = layoutOf("phanthiet")
  const inhabited = HOUSES.filter((house) => house.map === "phanthiet" && house.kind !== "vacant")
  expect(layout.trails).toHaveLength((SQUARE_LAYOUT.trails?.length ?? 0) + inhabited.length)
  expect(layoutOf("phanthiet")).toBe(layout)
  expect(SQUARE_LAYOUT).toEqual(base)
})

it.each(["constructor", "toString", "__proto__"])("treats inherited property %s as an unknown map", (name) => {
  expect(layoutOf(name)).toBe(SQUARE_LAYOUT)
})
