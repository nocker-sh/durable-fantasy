import { expect, it } from "vitest"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { getNativeBimanualReachPose } from "#/world/scene/figure/get-native-bimanual-reach-pose"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
const poles = { l: [1, -0.3, -0.2] satisfies Point3, r: [-1, -0.3, -0.2] satisfies Point3 }
const distance = (first: readonly number[], second: readonly number[]) => Math.hypot(...first.map((value, index) => value - second[index]))

it("reaches the same world palms under every heading without changing bones, shoulders or legs", () => {
  for (const name of ["ヴィルヘルム", "ゾフィー"])
    for (const heading of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === name)],
        skeleton = skelFor(look, "idle", 0),
        before = structuredClone(skeleton)
      const rootY = groundFootwear(buildBody(look, skeleton, null).footwear).rootY,
        body: readonly [number, number] = [-1.2, 3.4]
      const targets = [armGripPoint(skeleton.p.lowerarm_r, skeleton.p.hand_r), armGripPoint(skeleton.p.lowerarm_l, skeleton.p.hand_l)].map((point) =>
        toHeadingWorldPoint(point, [body[0], rootY, body[1]], heading),
      )
      const posed = getNativeBimanualReachPose({ look, skeleton, targets, body, heading, poles })
      if (posed instanceof Error) throw posed
      expect(posed.rootY).toBe(rootY)
      expect(skeleton).toEqual(before)
      for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
        const lengths = armGripLengths(skeleton, hand),
          shoulder = posed.skeleton.p[`upperarm_${hand}`],
          elbow = posed.skeleton.p[`lowerarm_${hand}`],
          wrist = posed.skeleton.p[`hand_${hand}`]
        expect(distance(shoulder, elbow)).toBeCloseTo(lengths.upper, 12)
        expect(distance(elbow, wrist)).toBeCloseTo(lengths.forearm, 12)
        expect(distance(armGripPoint(elbow, wrist), posed.grips[hand])).toBeLessThan(1e-12)
      }
      for (const bone of Object.keys(skeleton.p))
        if (!["lowerarm_l", "hand_l", "lowerarm_r", "hand_r"].includes(bone)) expect(Reflect.get(posed.skeleton.p, bone)).toEqual(Reflect.get(skeleton.p, bone))
      expect(posed.skeleton.rest).toEqual(skeleton.rest)
    }
})

it("rejects malformed, nonfinite and unreachable targets", () => {
  const look = RESIDENT_LOOKS[0],
    skeleton = skelFor(look, "idle", 0),
    body: readonly [number, number] = [0, 0]
  for (const targets of [
    [],
    [[0, 3, 0]],
    [
      [0, 3, 0],
      [0.2, 3, 0],
    ],
    [
      [NaN, 0, 0],
      [0, 0, 0],
    ],
  ] satisfies (readonly Point3[])[])
    expect(getNativeBimanualReachPose({ look, skeleton, body, heading: 0, targets, poles })).toBeInstanceOf(Error)
  expect(
    getNativeBimanualReachPose({
      look,
      skeleton,
      body,
      heading: Infinity,
      targets: [
        [0, 0, 0],
        [0, 0, 0],
      ],
      poles,
    }),
  ).toBeInstanceOf(Error)
})
