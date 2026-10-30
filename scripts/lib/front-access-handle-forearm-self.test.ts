import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getFrontAccessHandleForearmSelfReview } from "#/scripts/lib/get-front-access-handle-forearm-self-review"
import { getFrontAccessHandleStepFrame } from "#/scripts/lib/get-front-access-handle-step-frame"
import { getFrontAccessHandleExternalObstacleContext } from "#/scripts/lib/get-front-access-handle-external-obstacle-context"
import { getNativeRigidForearmSelfIntervals } from "#/world/scene/figure/get-native-rigid-forearm-self-intervals"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("covers both owners' selected forearms and uncut cuffs throughout both walking directions without mutating their sources", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source),
      review = getFrontAccessHandleForearmSelfReview(source)
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

it("rejects hidden unreachable lifts even when the declared finite checkpoints are clear", () => {
  const source = fixture(),
    step = source.slot.packing?.front_access?.handle_review?.step_review
  if (!step) throw new Error("Missing source step")
  step.samples_per_cycle = 2
  step.foot_lift_m = 2
  for (const leaf of ["north", "south"] satisfies ("north" | "south")[])
    for (const phase of [0, 0.5, 1]) expect(getFrontAccessHandleStepFrame({ ...source, leaf, cycle: 0, phase })).not.toBeInstanceOf(Error)
  expect(getFrontAccessHandleForearmSelfReview(source)).toBeInstanceOf(Error)
})

it("requires the garment and leg declarations and refuses a reference with a displaced wrist", () => {
  const source = fixture(),
    context = getFrontAccessHandleExternalObstacleContext({ ...source, leaf: "north" })
  if (context instanceof Error) throw context
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
    } satisfies Parameters<typeof getNativeRigidForearmSelfIntervals>[0]
  expect(getNativeRigidForearmSelfIntervals({ ...props, reference: { ...props.reference, p: { ...props.reference.p, hand_r: [0, 0, 0] } } })).toBeInstanceOf(Error)
  const step = source.slot.packing?.front_access?.handle_review?.step_review
  if (!step) throw new Error("Missing source step")
  delete step.upper_clearance_review
  expect(getFrontAccessHandleForearmSelfReview(source)).toBeInstanceOf(Error)
})
