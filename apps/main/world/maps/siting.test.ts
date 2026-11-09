import { describe, expect, it } from "vitest"
import { HOUSES } from "#/world/town/houses"
import { MAPS } from "#/world/maps/index"
import { spotsOn } from "#/world/maps/spots-on"
import { layoutOf } from "#/world/maps/layouts"
import { sitingProblems } from "#/world/maps/siting"

describe("where the houses stand (town.md「町の並び」)", () => {
  const streets = [...new Set(HOUSES.map((h) => h.map))]
  for (const map of streets)
    it(`${map}: every house clear of the others by an alley, off the roads, the square, the river and the yards, its door onto free ground`, () => {
      expect(
        sitingProblems(
          layoutOf(map),
          HOUSES.filter((h) => h.map === map),
        ),
      ).toEqual([])
    })

  it("nobody out of doors stands inside a house's walls", () => {
    for (const map of streets)
      for (const s of spotsOn(MAPS[map])) {
        const pair1 = [(s.cell[0] + 0.5) / 2, (s.cell[1] + 0.5) / 2]
        const x = pair1[0],
          z = pair1[1]
        const h = HOUSES.find((h) => h.map === map && x > h.x0 && x < h.x1 && z > h.z0 && z < h.z1)
        expect(h?.id, `${map} ${s.name}「${s.doing}」`).toBeUndefined()
      }
  })
})
