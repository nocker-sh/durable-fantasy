import { expect, it } from "vitest"
import { solveFootTarget } from "#/world/scene/figure/solve-foot-target"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { RESIDENT_LOOKS } from "#/world/town/residents"
it("rejects an unreachable foot atomically without mutating the source skeleton", () => {
  const skeleton = skelFor(RESIDENT_LOOKS[0], "idle", 0),
    before = structuredClone(skeleton)
  expect(solveFootTarget({ skeleton, side: "l", target: [10, 0, 0] })).toEqual(new Error("Native foot target is unreachable without stretching the leg"))
  expect(skeleton).toEqual(before)
  expect(solveFootTarget({ skeleton, side: "r", target: [NaN, 0, 0] })).toEqual(new Error("Invalid native foot target"))
})
