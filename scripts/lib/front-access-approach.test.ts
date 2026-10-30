import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getFrontAccessApproachFrame } from "#/scripts/lib/get-front-access-approach-frame"
import { getFrontAccessApproachError } from "#/scripts/lib/get-front-access-approach-error"
import { getNativePlantedFootwearError } from "#/world/scene/figure/get-native-planted-footwear-error"
import { BONE_ORDER } from "#/world/scene/rig"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("moves only the declared native arm, keeps both link lengths and approaches the actual moving cutout", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source)
    expect(getFrontAccessApproachError(source)).toBeNull()
    for (const leaf of ["north", "south"] satisfies ("north" | "south")[])
      for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
        const frame = getFrontAccessApproachFrame({ ...source, leaf, progress })
        if (frame instanceof Error) throw frame
        for (const bone of BONE_ORDER) if (bone !== "lowerarm_r" && bone !== "hand_r") expect(frame.posed.skeleton.p[bone]).toEqual(frame.skeleton.p[bone])
        expect(frame.posed.skeleton.q).toBe(frame.skeleton.q)
        expect(frame.posed.skeleton.rest).toBe(frame.skeleton.rest)
        const p = frame.posed.skeleton.p,
          rest = frame.skeleton.rest
        for (const pair of [
          ["upperarm_r", "lowerarm_r"],
          ["lowerarm_r", "hand_r"],
        ] satisfies (readonly ["upperarm_r" | "lowerarm_r", "lowerarm_r" | "hand_r"])[])
          expect(Math.hypot(...p[pair[1]].map((value, axis) => value - p[pair[0]][axis]))).toBeCloseTo(Math.hypot(...rest[pair[1]].map((value, axis) => value - rest[pair[0]][axis])), 12)
        const grip = toHeadingWorldPoint(frame.posed.solution.grip, [frame.body[0], frame.posed.rootY, frame.body[1]], Math.PI / 2)
        expect(grip[0]).toBeCloseTo(frame.pull.x0 - (source.slot.packing?.front_access?.approach_review?.target_clearance_m ?? NaN), 12)
        expect(grip[1]).toBeCloseTo((frame.pull.bottom + frame.pull.top) / 2, 12)
        expect(grip[2]).toBeCloseTo((frame.pull.z0 + frame.pull.z1) / 2, 12)
      }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("does not misclassify independently relocated standing samples as planted motion", () => {
  const source = fixture(),
    from = getFrontAccessApproachFrame({ ...source, leaf: "north", progress: 0 }),
    to = getFrontAccessApproachFrame({ ...source, leaf: "north", progress: 1 })
  if (from instanceof Error || to instanceof Error) throw new Error("Missing source approach")
  expect(
    getNativePlantedFootwearError({
      look: from.look,
      heading: Math.PI / 2,
      sides: ["l", "r"],
      from: { skeleton: from.posed.skeleton, rootY: from.posed.rootY, body: from.body },
      to: { skeleton: to.posed.skeleton, rootY: to.posed.rootY, body: to.body },
    }),
  ).toBeInstanceOf(Error)
})

it("refuses treating close approach as contact and refuses invalid owners, frames or samples", () => {
  const source = fixture(),
    review = source.slot.packing?.front_access?.approach_review
  if (!review) throw new Error("Missing standing approach source")
  review.target_clearance_m = 0.01
  expect(getFrontAccessApproachError(source)).toBeInstanceOf(Error)
  review.target_clearance_m = 0.14
  for (const progress of [-1, 2, NaN]) expect(getFrontAccessApproachFrame({ ...source, leaf: "north", progress })).toBeInstanceOf(Error)
  for (const samples of [0, -1, 0.5, 129, NaN]) {
    review.samples = samples
    expect(getFrontAccessApproachError(source)).toBeInstanceOf(Error)
  }
  review.samples = 8
  review.frame = 999
  expect(getFrontAccessApproachError(source)).toBeInstanceOf(Error)
  review.frame = 0
  review.operator = "resident-別人"
  expect(getFrontAccessApproachError(source)).toBeInstanceOf(Error)
})
