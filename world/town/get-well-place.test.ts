import { expect, it } from "vitest"
import { getWellPlace } from "#/world/town/get-well-place"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { MAPS } from "#/world/maps/index"
it("preserves both existing named scene places within their exported walk cells", () => {
  for (const name of ["well", "well2"] satisfies ("well" | "well2")[]) {
    const point = getWellPlace(SQUARE_LAYOUT.plaza, name),
      cell = MAPS.phanthiet.places[name]
    expect(point.map((value) => Math.floor(value * 2))).toEqual(cell)
  }
})
