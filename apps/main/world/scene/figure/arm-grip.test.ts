import { buildBody } from "#/world/scene/figure/body"
import { createBodyContext } from "#/world/scene/figure/context"
import { buildClothes } from "#/world/scene/figure/clothes"
import { buildArms } from "#/world/scene/figure/arms"
import { expect, it } from "vitest"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(...a.map((v, i) => v - b[i]))
it("uses the operators' actual native arm lengths and rejects the former overhead grip", () => {
  for (const name of ["エーリヒ", "クレメンス"]) {
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => r.name === name)],
      skel = skelFor(look, "idle", 0),
      lengths = armGripLengths(skel, "r"),
      shoulder = skel.p.upperarm_r
    expect(lengths.upper + lengths.forearm + lengths.palm).toBeCloseTo(0.37)
    expect(solveArmGrip({ skeleton: skel, side: "r", target: [shoulder[0], 1.8, shoulder[2]], pole: [0, 1, 1] })).toBeUndefined()
    const target: [number, number, number] = [shoulder[0] - 0.25, shoulder[1] + 0.05, shoulder[2] + 0.1],
      solution = solveArmGrip({ skeleton: skel, side: "r", target: target, pole: [1, 0, 1] })!
    expect(distance(shoulder, solution.elbow)).toBeCloseTo(lengths.upper, 12)
    expect(distance(solution.elbow, solution.wrist)).toBeCloseTo(lengths.forearm, 12)
    expect(distance(solution.grip, target)).toBeLessThan(1e-12)
    const posed = { ...skel, p: { ...skel.p, lowerarm_r: solution.elbow, hand_r: solution.wrist } },
      context = createBodyContext(look, posed, null),
      clothes = buildClothes(context),
      before = context.prims.length
    const arms = buildArms({ ...context, ...clothes })
    expect(distance(arms.hands.R.p, target)).toBeLessThan(1e-12)
    expect(context.prims.slice(before).some((p) => p.kind === "sdf" && typeof p.sd === "function" && p.sd(target) < 0)).toBe(true)
  }
})
it("keeps the existing native palm attachment", () => {
  expect(armGripPoint([0, 0, 0], [0, 0.15, 0])).toEqual([0, 0.2, 0])
})

it("finds a raised grip with the native kneeling arm but requires a closer body position", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => r.name === "エーリヒ")],
    skel = skelFor(look, "scrub", 0),
    shoes = buildBody(look, skel, null)
      .prims.filter((p) => p.kind === "cap")
      .slice(0, 2)
  const root = -Math.min(...shoes.map((p) => Math.min(p.a[1], p.b[1]) - p.r))
  expect(solveArmGrip({ skeleton: skel, side: "r", target: [-0.25, 0.064 - root, 0.35], pole: [-1, 0, 1] })).toBeUndefined()
  const candidate = solveArmGrip({ skeleton: skel, side: "r", target: [-0.25, 0.4 - root, 0.35], pole: [-1, 0, 1] })
  expect(candidate).toBeDefined()
  expect(solveArmGrip({ skeleton: skel, side: "r", target: [-0.25, 0.4 - root, 0.55], pole: [-1, 0, 1] })).toBeUndefined()
})
