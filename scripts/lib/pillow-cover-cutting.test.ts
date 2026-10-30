import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
import { getPillowCoverCuttingReview } from "#/scripts/lib/get-pillow-cover-cutting-review"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    materials = sleepingMaterialsSchema.parse(room.sleeping_materials)
  if (!materials.pillow_cover_cutting) throw new Error("Missing pillow cover proposal")
  room.sleeping_materials = materials
  return { room, cutting: materials.pillow_cover_cutting }
}

it("allocates separate complete six-face covers and cloths to each sleeper without changing the pillow", () => {
  const identities: string[] = []
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source.room),
      review = getPillowCoverCuttingReview(source.room)
    if (review instanceof Error) throw review
    identities.push(review.source.cloth_id)
    expect(new Set(review.cuts.map((cut) => cut.id)).size).toBe(12)
    expect(review.cuts.filter((cut) => cut.id.startsWith(`bed-h1-${number}-1:pillow:cover:`))).toHaveLength(6)
    expect(review.cuts.filter((cut) => cut.id.startsWith(`bed-h1-${number}-1:pillow:spare-cover:`))).toHaveLength(6)
    expect(review.textile.tailor).toBe("resident-マグダレーナ")
    expect(JSON.stringify(source.room)).toBe(before)
  }
  expect(new Set(identities).size).toBe(2)
})

it("rejects a missing or duplicate face, a foreign pillow or owner and reused blanket cloth", () => {
  const missing = fixture()
  missing.cutting.cuts.pop()
  expect(getPillowCoverCuttingReview(missing.room)).toBeInstanceOf(Error)
  const duplicate = fixture()
  duplicate.cutting.cuts[1].face = duplicate.cutting.cuts[0].face
  expect(getPillowCoverCuttingReview(duplicate.room)).toBeInstanceOf(Error)
  const foreign = fixture()
  foreign.cutting.pillow = "bed-h1-4-1:pillow"
  expect(getPillowCoverCuttingReview(foreign.room)).toBeInstanceOf(Error)
  const owner = fixture()
  owner.cutting.owner = "resident-ゾフィー"
  expect(getPillowCoverCuttingReview(owner.room)).toBeInstanceOf(Error)
  const reused = fixture()
  reused.cutting.cloth_id = "storage-h1-3-1:blanket-cloth"
  expect(getPillowCoverCuttingReview(reused.room)).toBeInstanceOf(Error)
})

it("rejects overlap, lost cloth edges and insufficient cloth without shrinking the filled faces", () => {
  const overlap = fixture()
  overlap.cutting.cuts[1].origin_m = [...overlap.cutting.cuts[0].origin_m]
  expect(getPillowCoverCuttingReview(overlap.room)).toBeInstanceOf(Error)
  const edge = fixture()
  edge.cutting.cuts[0].origin_m[0] = 0
  expect(getPillowCoverCuttingReview(edge.room)).toBeInstanceOf(Error)
  const short = fixture()
  short.cutting.length_m = 1
  expect(getPillowCoverCuttingReview(short.room)).toBeInstanceOf(Error)
})
