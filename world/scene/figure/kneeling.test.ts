import { expect, it } from "vitest"
import { kneelingPose } from "./kneeling"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { buildBody } from "./body"
import { groundFootwear } from "./footing"
import { primitiveBounds } from "../../../lib/graphics/ray/primitive-bounds"
import { RESIDENTS, RESIDENT_LOOKS } from "../../town/residents"
const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(...a.map((v, i) => v - b[i]))
it("plants both original shoe orientations and the actual clothed knee at fixed leg lengths", () => {
  for (const name of ["エーリヒ", "クレメンス"]) {
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => r.name === name)],
      source = skelFor(look, "scrub", 0),
      before = structuredClone(source),
      posed = kneelingPose(look, source, { pelvis_drop_m: 0.015, knee: "r" }),
      body = buildBody(look, posed, null),
      floor = groundFootwear(body.footwear),
      knee = body.knees.r!
    expect(source).toEqual(before)
    expect(floor.feet.every((f) => Math.abs(f.clearance) < 1e-12)).toBe(true)
    expect(knee.c[1] + floor.rootY - knee.r).toBeCloseTo(0, 12)
    const contact: [number, number, number] = [knee.c[0], knee.c[1] - knee.r, knee.c[2]]
    expect(body.prims.some((p) => p.kind === "sdf" && Math.abs(p.sd!(contact)) < 1e-9)).toBe(true)
    for (const p of body.prims) expect(primitiveBounds(p).min[1] + floor.rootY).toBeGreaterThanOrEqual(-1e-12)
    for (const side of ["l", "r"] as const) {
      const a = `thigh_${side}` as const,
        b = `calf_${side}` as const,
        c = `foot_${side}` as const,
        d = `ball_${side}` as const
      for (const [from, to] of [
        [a, b],
        [b, c],
        [c, d],
      ] as const)
        expect(distance(posed.p[from], posed.p[to])).toBeCloseTo(distance(source.rest[from], source.rest[to]), 12)
      expect(posed.q[c]).toEqual(source.q[c])
      expect(posed.p[c][0]).toBe(source.p[c][0])
      expect(posed.p[c][2]).toBe(source.p[c][2])
    }
  }
})
it("rejects invalid drops and constraints beyond fixed-length reach", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => r.name === "エーリヒ")],
    source = skelFor(look, "scrub", 0)
  for (const drop of [0, -0.01, NaN]) expect(() => kneelingPose(look, source, { pelvis_drop_m: drop, knee: "r" })).toThrow("Invalid")
  expect(() => kneelingPose(look, source, { pelvis_drop_m: 2, knee: "r" })).toThrow("unreachable")
  expect(() => kneelingPose(look, source, { pelvis_drop_m: 0.015, knee: "l" })).toThrow("unreachable")
})
