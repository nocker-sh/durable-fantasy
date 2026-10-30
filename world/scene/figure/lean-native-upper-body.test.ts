import { expect, it } from "vitest"
import { leanNativeUpperBody } from "#/world/scene/figure/lean-native-upper-body"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FRAMES } from "#/world/scene/figure/animation"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { attach } from "#/world/scene/attach"
import type { Bone } from "#/world/scene/rig"
const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")]
const pairs: readonly (readonly [Bone, Bone])[] = [
  ["pelvis", "spine_01"],
  ["spine_01", "spine_02"],
  ["spine_02", "spine_03"],
  ["spine_03", "neck_01"],
  ["neck_01", "head"],
  ["spine_03", "clavicle_l"],
  ["clavicle_l", "upperarm_l"],
  ["upperarm_l", "lowerarm_l"],
  ["lowerarm_l", "hand_l"],
  ["spine_03", "clavicle_r"],
  ["clavicle_r", "upperarm_r"],
  ["upperarm_r", "lowerarm_r"],
  ["lowerarm_r", "hand_r"],
]

it("preserves every upper-chain length, all leg joints and exact shoe grounding in native frames", () => {
  for (const animation of ["idle", "look"] satisfies ("idle" | "look")[])
    for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
      const original = skelFor(look, animation, frame),
        before = structuredClone(original),
        leaned = leanNativeUpperBody({ skeleton: original, angle: Math.PI / 12 })
      if (leaned instanceof Error) throw leaned
      for (const pair of pairs) {
        const oldLength = Math.hypot(...original.p[pair[0]].map((value, axis) => value - original.p[pair[1]][axis])),
          newLength = Math.hypot(...leaned.p[pair[0]].map((value, axis) => value - leaned.p[pair[1]][axis]))
        expect(newLength).toBeCloseTo(oldLength, 12)
      }
      for (const bone of ["pelvis", "thigh_l", "calf_l", "foot_l", "ball_l", "thigh_r", "calf_r", "foot_r", "ball_r"] satisfies Bone[]) {
        expect(leaned.p[bone]).toEqual(original.p[bone])
        expect(leaned.q[bone]).toEqual(original.q[bone])
      }
      expect(leaned.p.head[2]).toBeGreaterThan(original.p.head[2])
      expect(groundFootwear(buildBody(look, leaned, null).footwear)).toEqual(groundFootwear(buildBody(look, original, null).footwear))
      expect(original).toEqual(before)
      expect(leaned.rest).toBe(original.rest)
    }
})
it("rotates attached clothing and head points with the same rigid upper chain", () => {
  const original = skelFor(look, "idle", 0),
    angle = Math.PI / 6,
    leaned = leanNativeUpperBody({ skeleton: original, angle })
  if (leaned instanceof Error) throw leaned
  const before = attach(original, "spine_03", original.rest.head),
    after = attach(leaned, "spine_03", original.rest.head),
    pivot = original.p.pelvis,
    dy = before[1] - pivot[1],
    dz = before[2] - pivot[2]
  expect(after[0]).toBeCloseTo(before[0], 12)
  expect(after[1]).toBeCloseTo(pivot[1] + dy * Math.cos(angle) - dz * Math.sin(angle), 12)
  expect(after[2]).toBeCloseTo(pivot[2] + dy * Math.sin(angle) + dz * Math.cos(angle), 12)
})
it("preserves the zero-angle pose and rejects invalid angles or stale hand contacts", () => {
  const skeleton = skelFor(look, "idle", 0)
  expect(leanNativeUpperBody({ skeleton, angle: 0 })).toBe(skeleton)
  for (const angle of [-0.1, NaN, Infinity, Math.PI / 2]) expect(leanNativeUpperBody({ skeleton, angle })).toBeInstanceOf(Error)
  const held = { ...skeleton, handGrips: { l: { axis: [1, 0, 0], across: [0, 1, 0], halfWidth: 0.01, halfDepth: 0.01 } } } satisfies typeof skeleton
  expect(leanNativeUpperBody({ skeleton: held, angle: 0.1 })).toEqual(new Error("Native lean must precede hand contact constraints"))
})
