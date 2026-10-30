import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getFrontAccessHandleUpperClearanceReview } from "#/scripts/lib/get-front-access-handle-upper-clearance-review"
import { getFrontAccessHandleExternalObstacleContext } from "#/scripts/lib/get-front-access-handle-external-obstacle-context"
import { getFrontAccessHandleStepFrame } from "#/scripts/lib/get-front-access-handle-step-frame"
import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getNativeRigidUpperPoseMismatchError } from "#/world/scene/figure/get-native-rigid-upper-pose-mismatch-error"
import { getNativeRigidUpperTopologyError } from "#/world/scene/figure/get-native-rigid-upper-topology-error"
import { getNativeSideStepRigidUpperIntervals } from "#/world/scene/figure/get-native-side-step-rigid-upper-intervals"
import { getNativeFixedCuboidClearanceError } from "#/world/scene/figure/get-native-fixed-cuboid-clearance-error"
import { getHeadingLocalTranslationBounds } from "#/world/scene/get-heading-local-translation-bounds"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { withNativeLegPose } from "#/world/scene/figure/with-native-leg-pose"
import { buildBody } from "#/world/scene/figure/body"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("covers both owners' garments throughout both directions and preserves the actual upper pose in every cycle", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source),
      review = getFrontAccessHandleUpperClearanceReview(source)
    if (review instanceof Error) throw review
    expect(review.map((entry) => entry.leaf)).toEqual(["north", "south"])
    for (const leaf of review) {
      expect(leaf.intervals[0].from).toBe(0)
      expect(leaf.intervals[leaf.intervals.length - 1].to).toBe(1)
      for (const pair of leaf.intervals.entries()) {
        expect(pair[1].from).toBeLessThan(pair[1].to)
        if (pair[0]) expect(pair[1].from).toBe(leaf.intervals[pair[0] - 1].to)
      }
      const reference = getFrontAccessHandleFrame({ ...source, leaf: leaf.leaf, progress: 0 })
      if (reference instanceof Error) throw reference
      for (const cycle of [0, 1, 2, 3])
        for (const phase of [0, 0.25, 0.5, 0.75, 1]) {
          const frame = getFrontAccessHandleStepFrame({ ...source, leaf: leaf.leaf, cycle, phase })
          if (frame instanceof Error) throw frame
          expect(frame.bar).toEqual(reference.bar)
          expect(getNativeRigidUpperPoseMismatchError({ expected: reference.posed.skeleton, actual: frame.posed.skeleton })).toBeNull()
        }
    }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("refuses unrelated reference bones, changed rest geometry and an interval that could fold the garment", () => {
  const frame = getFrontAccessHandleFrame({ ...fixture(), leaf: "north", progress: 0 })
  if (frame instanceof Error) throw frame
  const skeleton = frame.posed.skeleton,
    before = JSON.stringify(skeleton)
  expect(getNativeRigidUpperTopologyError({ look: frame.look, skeleton, kneeMargins: { l: 0, r: 0 } })).toBeNull()
  expect(getNativeRigidUpperTopologyError({ look: frame.look, skeleton, kneeMargins: { l: 1, r: 1 } })).toBeInstanceOf(Error)
  expect(getNativeRigidUpperPoseMismatchError({ expected: skeleton, actual: { ...skeleton, p: { ...skeleton.p, head: [0, 0, 0] } } })).toBeInstanceOf(Error)
  expect(withNativeLegPose({ upper: skeleton, legs: { ...skeleton, rest: { ...skeleton.rest } } })).toBeInstanceOf(Error)
  expect(withNativeLegPose({ upper: skeleton, legs: { ...skeleton, p: { ...skeleton.p, pelvis: [0, 0, 0] } } })).toBeInstanceOf(Error)
  expect(JSON.stringify(skeleton)).toBe(before)
})

it("rejects a real head collision between clear endpoints using the full translation envelope", () => {
  const source = fixture(),
    middle = getFrontAccessHandleFrame({ ...source, leaf: "north", progress: 0.5 }),
    context = getFrontAccessHandleExternalObstacleContext({ ...source, leaf: "north" }),
    end = getFrontAccessHandleFrame({ ...source, leaf: "north", progress: 1 })
  if (middle instanceof Error || context instanceof Error || end instanceof Error) throw new Error("Missing source walk")
  const head = buildBody(middle.look, middle.posed.skeleton, null).head,
    point = toHeadingWorldPoint(head.c, [middle.body[0], middle.posed.rootY, middle.body[1]], Math.PI / 2)
  const box = { x0: point[0] - 0.001, x1: point[0] + 0.001, z0: point[2] - 0.001, z1: point[2] + 0.001, bottom: point[1] - 0.001, top: point[1] + 0.001 }
  for (const frame of [context.start, end])
    expect(
      getNativeFixedCuboidClearanceError({ look: frame.look, skeleton: frame.posed.skeleton, body: frame.body, rootY: frame.posed.rootY, heading: Math.PI / 2, ceiling: 2, obstacles: [box] }),
    ).toBeNull()
  expect(
    getNativeFixedCuboidClearanceError({ look: middle.look, skeleton: middle.posed.skeleton, body: middle.body, rootY: middle.posed.rootY, heading: Math.PI / 2, ceiling: 2, obstacles: [box] }),
  ).toBeInstanceOf(Error)
  const local = getHeadingLocalTranslationBounds({
    box,
    from: [context.start.body[0], context.start.posed.rootY, context.start.body[1]],
    to: [end.body[0], end.posed.rootY, end.body[1]],
    heading: Math.PI / 2,
  })
  if (local instanceof Error) throw local
  const frame = context.start,
    props = {
      look: frame.look,
      native: frame.native,
      reference: frame.posed.skeleton,
      pelvisDrop: context.step.source.standing_support.pelvis_drop_m,
      stride: context.step.stride,
      lift: context.step.step.foot_lift_m,
      direction: "right",
      ceiling: context.ceiling,
      hand: frame.hand,
      bar: frame.bar,
      pole: context.step.source.elbow_pole,
    } satisfies Omit<Parameters<typeof getNativeSideStepRigidUpperIntervals>[0], "boxes">
  expect(getNativeSideStepRigidUpperIntervals({ ...props, boxes: [...context.fixedBoxes, ...context.movingBoxes, local] })).toBeInstanceOf(Error)
  expect(getNativeSideStepRigidUpperIntervals({ ...props, reference: { ...props.reference, p: { ...props.reference.p, head: [0, 0, 0] } }, boxes: [] })).toBeInstanceOf(Error)
})
