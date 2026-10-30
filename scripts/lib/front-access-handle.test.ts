import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getFrontAccessHandleError } from "#/scripts/lib/get-front-access-handle-error"
import { getCertifiedSingleBarBodyError } from "#/world/scene/figure/get-certified-single-bar-body-error"
import { buildBody } from "#/world/scene/figure/body"
import { createBodyContext } from "#/world/scene/figure/context"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import { BONE_ORDER } from "#/world/scene/rig"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("keeps complete one-hand contact, actual posts, solid leaves and the opposite arm for both owners", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source)
    expect(getFrontAccessHandleError(source)).toBeNull()
    for (const leaf of ["north", "south"] satisfies ("north" | "south")[])
      for (const progress of [0, 0.5, 1]) {
        const frame = getFrontAccessHandleFrame({ ...source, leaf, progress })
        if (frame instanceof Error) throw frame
        expect(frame.parts.posts).toHaveLength(2)
        expect(frame.posed.skeleton.handGrips?.r).toBeDefined()
        expect(frame.posed.skeleton.handGrips?.l).toBeUndefined()
        for (const bone of BONE_ORDER) if (bone !== "lowerarm_r" && bone !== "hand_r") expect(frame.posed.skeleton.p[bone]).toEqual(frame.skeleton.p[bone])
        expect(frame.posed.skeleton.q).toBe(frame.skeleton.q)
        expect(frame.posed.skeleton.rest).toBe(frame.skeleton.rest)
        const bridge = frame.parts.bar
        for (const x of [bridge.x0, bridge.x1])
          for (const y of [bridge.bottom, bridge.top])
            for (const z of [bridge.z0, bridge.z1]) {
              const point = toHeadingLocalPoint([x, y, z], [frame.body[0], frame.posed.rootY, frame.body[1]], Math.PI / 2)
              expect(Math.hypot(point[0] - frame.bar.from[0], point[2] - frame.bar.from[2])).toBeLessThanOrEqual(frame.bar.radius + 1e-12)
              expect(point[1]).toBeGreaterThanOrEqual(frame.bar.from[1] - 1e-12)
              expect(point[1]).toBeLessThanOrEqual(frame.bar.to[1] + 1e-12)
            }
      }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("rejects sliding the front panel through the rear handle instead of hiding attached hardware", () => {
  const source = fixture(),
    review = source.slot.packing?.front_access?.handle_review
  if (!review) throw new Error("Missing raised handle source")
  review.handle.north_travel_m = 0.46
  const result = getFrontAccessHandlePlan(source)
  if (!(result instanceof Error)) throw new Error("Missing blocked-handle diagnosis")
  expect(result.message).toBe("Raised cabinet handle or solid panel intersects an obstacle")
})

it("requires a real selected palm profile and keeps the opposite arm solid against the whole bar", () => {
  const source = fixture(),
    frame = getFrontAccessHandleFrame({ ...source, leaf: "north", progress: 0 })
  if (frame instanceof Error) throw frame
  const missing = { ...frame.posed.skeleton, handGrips: undefined },
    bodyScale = createBodyContext(frame.look, frame.skeleton, null).S
  expect(getCertifiedSingleBarBodyError({ body: buildBody(frame.look, missing, null), skeleton: missing, bodyScale, hand: frame.hand, bar: frame.bar })).toBeInstanceOf(Error)
  const centre: [number, number, number] = [(frame.bar.from[0] + frame.bar.to[0]) / 2, (frame.bar.from[1] + frame.bar.to[1]) / 2, (frame.bar.from[2] + frame.bar.to[2]) / 2]
  const elbow: [number, number, number] = [centre[0], centre[1], centre[2] - 0.1],
    wrist: [number, number, number] = [centre[0], centre[1], centre[2] + 0.05]
  const colliding = { ...frame.posed.skeleton, p: { ...frame.posed.skeleton.p, lowerarm_l: elbow, hand_l: wrist } }
  expect(getCertifiedSingleBarBodyError({ body: buildBody(frame.look, colliding, null), skeleton: colliding, bodyScale, hand: frame.hand, bar: frame.bar })?.message).toBe(
    "Single grip body clearance remains unresolved",
  )
})

it("refuses foreign hardware, unsupported dimensions and invalid native samples", () => {
  const source = fixture(),
    review = source.slot.packing?.front_access?.handle_review
  if (!review) throw new Error("Missing raised handle source")
  for (const samples of [0, -1, 0.5, 129, NaN]) {
    review.samples = samples
    expect(getFrontAccessHandleError(source)).toBeInstanceOf(Error)
  }
  review.samples = 8
  for (const progress of [-1, 2, NaN]) expect(getFrontAccessHandleFrame({ ...source, leaf: "north", progress })).toBeInstanceOf(Error)
  review.handle.height_m = 0.01
  expect(getFrontAccessHandlePlan(source)).toBeInstanceOf(Error)
  review.handle.height_m = 0.22
  review.handle.north_id = "other:front-handle-north"
  expect(getFrontAccessHandlePlan(source)).toEqual(new Error("Raised handle belongs to another personal storage"))
})
