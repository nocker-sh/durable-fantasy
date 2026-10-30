import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getPersonalBoxReachFrame } from "#/scripts/lib/get-personal-box-reach-frame"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { getNativeBimanualReachPose } from "#/world/scene/figure/get-native-bimanual-reach-pose"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { storageLidState } from "#/world/town/storage-lid-state"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  const slot = personalStorageSchema.parse(room.personal_storage)[0],
    source = slot.packing?.opening?.reach_review
  if (!source) throw new Error("Missing native box reach fixture")
  return { room, building, slot, source }
}

it("reaches every supported-rest endpoint with grounded knees and native arms", () => {
  for (const number of [3, 4]) {
    const source = fixture(number)
    for (const state of [0, 1, 2, 3]) {
      const frame = getPersonalBoxReachFrame({ ...source, state })
      if (frame instanceof Error) throw frame
      const body = buildBody(frame.look, frame.posed.skeleton, null),
        ground = groundFootwear(body.footwear),
        knee = body.knees.r
      expect(ground.feet.every((foot) => Math.abs(foot.clearance) < 1e-12)).toBe(true)
      expect(knee).toBeDefined()
      if (!knee) throw new Error("Missing right knee surface")
      expect(knee.c[1] + frame.posed.rootY - knee.r).toBeCloseTo(0, 12)
      expect(frame.posed.skeleton.rest).toEqual(frame.skeleton.rest)
      const review = getPersonalBoxLidReview(source)
      if (review instanceof Error) throw review
      const wood = storageLidState(review, state).filter((part) => part.part === "lid-handle")
      expect(
        frame.targets.every((point) => wood.some((part) => point[0] > part.x0 && point[0] < part.x1 && point[1] > part.y0 && point[1] < part.y1 && point[2] > part.z0 && point[2] < part.z1)),
      ).toBe(true)
    }
  }
})

it("does not substitute standing, another operator or targets beyond the real edge", () => {
  const source = fixture(),
    frame = getPersonalBoxReachFrame({ ...source, state: 0 })
  if (frame instanceof Error) throw frame
  expect(
    getNativeBimanualReachPose({
      look: frame.look,
      skeleton: skelFor(frame.look, "idle", 0),
      targets: frame.targets,
      body: frame.body,
      heading: Math.PI / 2,
      poles: { l: [1, -0.3, -0.2], r: [-1, -0.3, -0.2] },
    }),
  ).toBeInstanceOf(Error)
  source.source.operator = "resident-ゾフィー"
  expect(getPersonalBoxReachFrame({ ...source, state: 0 })).toBeInstanceOf(Error)
  const edge = fixture()
  edge.source.hand_half_span_m = 0.3
  expect(getPersonalBoxReachFrame({ ...edge, state: 0 })).toBeInstanceOf(Error)
  for (const state of [-1, 4, 0.5, NaN]) expect(getPersonalBoxReachFrame({ ...fixture(), state })).toBeInstanceOf(Error)
})

it("retains the old unsupported floor pickup as an unreachable regression", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      packing = source.slot.packing,
      opening = packing?.opening
    if (!packing || !opening || !source.room.grid) throw new Error("Missing lid fixture")
    opening.rest_support = null
    opening.rest_center_m = [2, 0, 5.05]
    packing.height_m -= packing.lid_handle?.height_m ?? 0
    delete packing.lid_handle
    source.source.target = "west_edge"
    source.source.hand_half_span_m = 0.15
    source.room.furniture = source.room.furniture?.filter((piece) => piece.symbol !== "R")
    source.room.grid.rows = source.room.grid.rows.map((row) => row.replaceAll("R", "."))
    expect(getPersonalBoxReachFrame({ ...source, state: 3 })).toEqual(new Error("Left box grip is unreachable without stretching the arm"))
  }
})
