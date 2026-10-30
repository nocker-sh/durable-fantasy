import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getPersonalBoxReachFrame } from "#/scripts/lib/get-personal-box-reach-frame"
import { getPersonalBoxFixedClearanceError } from "#/scripts/lib/get-personal-box-fixed-clearance-error"
import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { getPersonalBoxLidSupport } from "#/scripts/lib/get-personal-box-lid-support"
import { buildBody } from "#/world/scene/figure/body"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"

function fixture(number: number, state: number, bareEdge = false) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  const slot = personalStorageSchema.parse(room.personal_storage)[0]
  if (bareEdge && slot.packing?.opening?.reach_review) {
    slot.packing.height_m -= slot.packing.lid_handle?.height_m ?? 0
    delete slot.packing.lid_handle
    slot.packing.opening.reach_review.target = "west_edge"
    slot.packing.opening.reach_review.hand_half_span_m = 0.15
  }
  const frame = getPersonalBoxReachFrame({ room, slot, building, state })
  if (frame instanceof Error) throw frame
  return { room, building, slot, frame }
}

it("keeps every native body part clear of the fixed box, its contents, the rest and walls at every handle endpoint", () => {
  for (const number of [3, 4])
    for (const state of [0, 1, 2, 3]) {
      const source = fixture(number, state),
        before = JSON.stringify(source.room)
      expect(getPersonalBoxFixedClearanceError(source)).toBeNull()
      expect(JSON.stringify(source.room)).toBe(before)
    }
})

it("rejects the closed and resting bare-edge reaches instead of excluding their arms from fixed-furniture checks", () => {
  for (const number of [3, 4])
    for (const state of [0, 3]) {
      const error = getPersonalBoxFixedClearanceError(fixture(number, state, true))
      expect(error?.message).toContain("fixed furniture remains unresolved")
      expect(error?.cause).toEqual({ obstacle: expect.any(Number), primitive: expect.any(Number) })
    }
})

it("includes nearby furniture and the actual room ceiling in the raised-frame clearance", () => {
  const furniture = fixture(3, 1),
    bed = furniture.room.furniture?.find((piece) => piece.symbol === "B")
  if (!bed) throw new Error("Missing source bed")
  bed.rect = [1, 7, 1, 2]
  expect(getPersonalBoxFixedClearanceError(furniture)).toBeInstanceOf(Error)
  const missing = fixture(4, 2)
  missing.building.floor_levels = []
  expect(getPersonalBoxFixedClearanceError(missing)).toBeInstanceOf(Error)
  const low = fixture(4, 1)
  low.building.floor_levels = [{ floor: 1, elevation_m: 2.52, ceiling_elevation_m: 3.32 }]
  expect(getPersonalBoxFixedClearanceError(low)?.message).toContain("checked ceiling")
})

it("finds common interior points of actual fixed boards and rendered arms, beyond an uncertain envelope", () => {
  for (const number of [3, 4])
    for (const state of [0, 3]) {
      const source = fixture(number, state, true),
        frame = source.frame,
        review = getPersonalBoxLidReview(source),
        support = getPersonalBoxLidSupport(source)
      if (review instanceof Error || support instanceof Error || !support) throw new Error("Missing fixed source solids")
      const solids = [...review.body, ...support.parts],
        body = buildBody(frame.look, frame.posed.skeleton, null)
      for (const target of frame.targets) {
        const point: readonly [number, number, number] = [target[0] + 0.005, frame.lid.y0 - 0.0075, target[2]]
        expect(solids.some((solid) => point[0] > solid.x0 && point[0] < solid.x1 && point[1] > solid.y0 && point[1] < solid.y1 && point[2] > solid.z0 && point[2] < solid.z1)).toBe(true)
        const local = toHeadingLocalPoint(point, [frame.body[0], frame.posed.rootY, frame.body[1]], Math.PI / 2)
        expect([...body.armParts.l, ...body.armParts.r].some((primitive) => primitive.sd !== undefined && primitive.sd([...local]) < -0.001)).toBe(true)
      }
    }
})
