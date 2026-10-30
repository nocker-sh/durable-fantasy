import { expect, it } from "vitest"
import { groundFootwear } from "./footing"
import { buildBody } from "./body"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { RESIDENTS, RESIDENT_LOOKS } from "../../town/residents"
it("grounds the rendered shoe end at the lowest point and reports the other shoe's gap", () => {
  const result = groundFootwear({ l: { a: [1, 1, 2], b: [1, 0.7, 3], r: 0.1 }, r: { a: [-1, 0.4, 2], b: [-1, 0.8, 3], r: 0.2 } })
  expect(result.rootY).toBeCloseTo(-0.2, 12)
  expect(result.feet[0].lowest[1]).toBeCloseTo(0.4, 12)
  expect(result.feet[1].lowest).toEqual([-1, 0, 2])
  expect(result.feet[1].clearance).toBe(0)
})
it("uses explicitly identified native footwear for both actual operators", () => {
  for (const name of ["エーリヒ", "クレメンス"]) {
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => r.name === name)],
      body = buildBody(look, skelFor(look, "scrub", 0), null),
      result = groundFootwear(body.footwear)
    for (const shoe of Object.values(body.footwear)) expect(body.prims.some((p) => p.kind === "cap" && p.a === shoe.a && p.b === shoe.b && p.r === shoe.r)).toBe(true)
    expect(result.rootY).toBeCloseTo(0.10312317250424533, 12)
    expect(result.feet.find((f) => f.side === "r")!.clearance).toBe(0)
    expect(result.feet.find((f) => f.side === "l")!.clearance).toBeCloseTo(0.034921087760099084, 12)
  }
})
