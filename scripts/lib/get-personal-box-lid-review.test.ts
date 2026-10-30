import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { getRoomStorageSection } from "#/scripts/lib/get-room-storage-section"
import { getPersonalBoxLidSupport } from "#/scripts/lib/get-personal-box-lid-support"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8"))
  const building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  const slot = personalStorageSchema.parse(room.personal_storage)[0]
  return { room, building, slot }
}

it("checks both source bedroom lids against walls, the sleeping bed and their packed belongings", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      review = getPersonalBoxLidReview(source)
    if (review instanceof Error) throw review
    expect(review.original.filter((part) => part.part !== "lid-handle")).toHaveLength(6)
    expect(review.original.filter((part) => part.part === "lid-handle")).toHaveLength(3)
    expect(review.offsets).toHaveLength(4)
    const section = getRoomStorageSection(source.room, source.building, ["C"])
    if (section instanceof Error) throw section
    expect(section.ceiling).toBeCloseTo(2.2)
    expect(section.obstacles).toContainEqual({ x0: 1.5, x1: 2.5, z0: 1, z1: 3, bottom: 0, top: section.ceiling })
  }
})

it("rejects putting the lid through a bed, a wall or outside the room", () => {
  for (const rest of [
    [2, 0, 2],
    [0.5, 0, 5.05],
    [2, 0, 6.4],
  ]) {
    const source = fixture(),
      opening = source.slot.packing?.opening
    if (!opening) throw new Error("Missing authored lid proposal")
    opening.rest_center_m = [rest[0], 0, rest[2]]
    opening.rest_support = null
    expect(getPersonalBoxLidReview(source)).toBeInstanceOf(Error)
  }
})

it("does not invent a ceiling, a building match or a missing opening proposal", () => {
  const missing = fixture()
  missing.building.floor_levels = []
  expect(getPersonalBoxLidReview(missing)).toBeInstanceOf(Error)
  const duplicate = fixture()
  duplicate.building.floor_levels = [
    { floor: 1, elevation_m: 2.52, ceiling_elevation_m: 4.72 },
    { floor: 1, elevation_m: 2.52, ceiling_elevation_m: 4.72 },
  ]
  expect(getPersonalBoxLidReview(duplicate)).toBeInstanceOf(Error)
  const wrong = fixture()
  wrong.building.id = "building-other"
  expect(getPersonalBoxLidReview(wrong)).toBeInstanceOf(Error)
  const absent = fixture()
  delete absent.slot.packing?.opening
  expect(getPersonalBoxLidReview(absent)).toBeInstanceOf(Error)
})

it("requires the resident's real solid rest, its measured top and matching height", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      support = getPersonalBoxLidSupport(source)
    if (!support || support instanceof Error) throw new Error("Missing source rest")
    expect(support.parts).toHaveLength(5)
    expect(support.parts.filter((part) => part.part === "leg")).toHaveLength(4)
    expect(support.top.top).toBe(source.slot.packing?.opening?.rest_center_m[1])
    const opening = source.slot.packing?.opening
    if (!opening) throw new Error("Missing opening")
    opening.rest_support = null
    expect(getPersonalBoxLidReview(source)).toBeInstanceOf(Error)
  }
  const foreign = fixture(),
    furniture = foreign.room.furniture?.find((piece) => piece.symbol === "R")
  if (!furniture) throw new Error("Missing rest furniture")
  furniture.owner = "別人"
  expect(getPersonalBoxLidReview(foreign)).toBeInstanceOf(Error)
  const ghost = fixture(),
    rest = ghost.room.furniture?.find((piece) => piece.symbol === "R")
  if (!rest) throw new Error("Missing rest furniture")
  rest.runtime_solid = false
  expect(getPersonalBoxLidReview(ghost)).toBeInstanceOf(Error)
})
