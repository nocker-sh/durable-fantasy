import { describe, expect, it } from "vitest"
import { HOUSEHOLDS, HOUSES } from "./houses.ts"
import { AISLE, TILE_M, fitHouse, piecesOf, rowsDepth } from "./fit.ts"
// whether each building holds its furniture is checked by laying it out for real (floorplan.test.ts)

describe("homes that hold the lives in them (town.md「世帯と建物」)", () => {
  it("every piece of furniture in the plans has a real size", () => {
    for (const h of HOUSES) for (const f of h.plan.furniture) expect(piecesOf(f), `${h.name}: ${f}`).not.toBeNull()
  })

  it("a house to let would hold a couple: two beds, a table and chairs, a chest, the hearth", () => {
    for (const h of HOUSES.filter((x) => x.kind === "vacant")) {
      const lived = { ...h, plan: { ...h.plan, furniture: ["寝台×2", "食卓", "椅子×2", "衣装箱"], rooms: h.plan.rooms.map((r) => (/寝室/.test(r.name) ? { ...r, beds: 2 } : r)) } }
      expect(fitHouse(lived, 2).ok, h.name).toBe(true)
    }
  })

  it("no home is far bigger than the life in it: at most 35 m² a person (30 for a modest one)", () => {
    for (const h of HOUSES.filter((x) => x.kind === "home")) {
      const hh = HOUSEHOLDS.find((x) => x.id === h.household)!
      const per = fitHouse(h, hh.members.length).area / hh.members.length
      expect(per, h.name).toBeLessThanOrEqual(hh.living === "慎ましい" ? 30 : 35)
    }
  })

  it("the scale and the walkway are as the plan says", () => {
    expect(TILE_M).toBe(1.4)
    // two beds facing across a room: their depth and one walkway between
    expect(
      rowsDepth(
        [
          { name: "寝台", w: 0.9, d: 2, front: 0.5 },
          { name: "寝台", w: 0.9, d: 2, front: 0.5 },
        ],
        1.0,
      ),
    ).toBe(4 + AISLE)
  })
})
