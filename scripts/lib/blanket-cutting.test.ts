import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
import { getBlanketCuttingReview } from "#/scripts/lib/get-blanket-cutting-review"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    materials = sleepingMaterialsSchema.parse(room.sleeping_materials)
  if (!materials.blanket_cutting) throw new Error("Missing cutting proposal")
  room.sleeping_materials = materials
  return { room, materials, cutting: materials.blanket_cutting }
}

it("allocates a distinct cloth and nonoverlapping in-use and spare cuts to each actual sleeper", () => {
  const identities: string[] = []
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source.room),
      review = getBlanketCuttingReview(source.room)
    if (review instanceof Error) throw review
    identities.push(review.source.cloth_id)
    expect(review.cuts.map((cut) => cut.id)).toEqual([`bed-h1-${number}-1:blanket`, `storage-h1-${number}-1:spare-blanket`])
    expect(review.cuts[0].size[0]).toBeCloseTo(0.9, 14)
    expect(review.cuts[0].size[1]).toBeCloseTo(1.36, 14)
    expect(review.textile.weaver).toBe("resident-ベルタ")
    expect(JSON.stringify(source.room)).toBe(before)
  }
  expect(new Set(identities).size).toBe(2)
})

it("rejects short cloth, overlapping cuts, lost border and a duplicate or foreign output", () => {
  const short = fixture()
  short.cutting.length_m = 2
  expect(getBlanketCuttingReview(short.room)).toBeInstanceOf(Error)
  const overlap = fixture()
  overlap.cutting.cuts[1].origin_m = [...overlap.cutting.cuts[0].origin_m]
  expect(getBlanketCuttingReview(overlap.room)).toBeInstanceOf(Error)
  const border = fixture()
  border.cutting.cuts[0].origin_m[0] = 0
  expect(getBlanketCuttingReview(border.room)).toBeInstanceOf(Error)
  const duplicate = fixture()
  duplicate.cutting.cuts[1].output = duplicate.cutting.cuts[0].output
  expect(getBlanketCuttingReview(duplicate.room)).toBeInstanceOf(Error)
  const foreign = fixture()
  foreign.cutting.owner = "resident-ゾフィー"
  expect(getBlanketCuttingReview(foreign.room)).toBeInstanceOf(Error)
  const reused = fixture()
  reused.cutting.cloth_id = "storage-h1-4-1:blanket-cloth"
  expect(getBlanketCuttingReview(reused.room)).toBeInstanceOf(Error)
})
