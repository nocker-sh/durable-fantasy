import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getFrontAccessHandleLegClearanceReview } from "#/scripts/lib/get-front-access-handle-leg-clearance-review"
import { getFrontAccessHandleLegObstacleContext } from "#/scripts/lib/get-front-access-handle-leg-obstacle-context"
import { getFrontAccessHandleStepFrame } from "#/scripts/lib/get-front-access-handle-step-frame"
import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getNativeSideStepLegExternalIntervals } from "#/world/scene/figure/get-native-side-step-leg-external-intervals"
import { getNativeFixedCuboidClearanceError } from "#/world/scene/figure/get-native-fixed-cuboid-clearance-error"
import { getHeadingLocalTranslationBounds } from "#/world/scene/get-heading-local-translation-bounds"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { buildBody } from "#/world/scene/figure/body"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("covers the actual owners' full steps against every fixed and attached cabinet part without gaps", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source),
      review = getFrontAccessHandleLegClearanceReview(source)
    if (review instanceof Error) throw review
    expect(review.map((entry) => entry.leaf)).toEqual(["north", "south"])
    for (const leaf of review) {
      expect(leaf.intervals.length).toBeGreaterThan(0)
      expect(leaf.intervals[0].from).toBe(0)
      expect(leaf.intervals[leaf.intervals.length - 1].to).toBe(1)
      for (const pair of leaf.intervals.entries()) {
        expect(pair[1].from).toBeLessThan(pair[1].to)
        if (pair[0]) expect(pair[1].from).toBe(leaf.intervals[pair[0] - 1].to)
      }
    }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("rejects a real shoe collision hidden between clear ground-level samples", () => {
  const source = fixture(),
    quarter = getFrontAccessHandleStepFrame({ ...source, leaf: "north", cycle: 0, phase: 0.25 })
  if (quarter instanceof Error) throw quarter
  const shoe = buildBody(quarter.look, quarter.posed.skeleton, null).footwear.r
  const point = toHeadingWorldPoint([shoe.b[0], shoe.b[1] + shoe.r * 0.9, shoe.b[2] + 0.02], [quarter.body[0], quarter.posed.rootY, quarter.body[1]], Math.PI / 2)
  const box = { x0: point[0] - 0.001, x1: point[0] + 0.001, z0: point[2] - 0.001, z1: point[2] + 0.001, bottom: point[1] - 0.001, top: point[1] + 0.001 }
  for (const phase of [0, 0.5, 1]) {
    const frame = getFrontAccessHandleStepFrame({ ...source, leaf: "north", cycle: 0, phase })
    if (frame instanceof Error) throw frame
    expect(
      getNativeFixedCuboidClearanceError({ look: frame.look, skeleton: frame.posed.skeleton, body: frame.body, rootY: frame.posed.rootY, heading: Math.PI / 2, ceiling: 2, obstacles: [box] }),
    ).toBeNull()
  }
  expect(
    getNativeFixedCuboidClearanceError({ look: quarter.look, skeleton: quarter.posed.skeleton, body: quarter.body, rootY: quarter.posed.rootY, heading: Math.PI / 2, ceiling: 2, obstacles: [box] }),
  ).toBeInstanceOf(Error)
  const context = getFrontAccessHandleLegObstacleContext({ ...source, leaf: "north" }),
    end = getFrontAccessHandleFrame({ ...source, leaf: "north", progress: 1 })
  if (context instanceof Error || end instanceof Error) throw new Error("Missing full-walk context")
  const local = getHeadingLocalTranslationBounds({
    box,
    from: [context.start.body[0], context.start.posed.rootY, context.start.body[1]],
    to: [end.body[0], end.posed.rootY, end.body[1]],
    heading: Math.PI / 2,
  })
  if (local instanceof Error) throw local
  expect(
    getNativeSideStepLegExternalIntervals({
      look: context.start.look,
      native: context.start.native,
      pelvisDrop: context.step.source.standing_support.pelvis_drop_m,
      stride: context.step.stride,
      lift: context.step.step.foot_lift_m,
      direction: "right",
      boxes: [...context.boxes, local],
      ceiling: context.ceiling,
    }),
  ).toEqual(new Error("Native shoe envelope intersects a solid"))
})
