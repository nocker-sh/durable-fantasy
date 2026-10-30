import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import { getPlaceReachError } from "#/scripts/lib/get-place-reach-error"
import { getTablewareInventory } from "#/scripts/lib/get-tableware-inventory"
import { getPlaceSettingBoxes } from "#/scripts/lib/get-place-setting-boxes"

const read = (path: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${path}.md`, import.meta.url), "utf8"))
const fixture = () => {
  const room = read("rooms/room-h1-1"),
    kitchen = read("rooms/room-h1-2")
  const documents = new Map([room, kitchen, read("residents/resident-ヴィルヘルム"), read("residents/resident-ゾフィー")].map((document) => [document.id, document]))
  return { room, documents, plan: tablePlaceSettingsSchema.parse(room.meal_place_settings) }
}
it("clears both diners' authored forearms and tableware through the connected preparation stages", () => {
  const f = fixture()
  expect(getPlaceReachError(f.room, f.plan, f.documents)).toBeNull()
})
it("rotates the same measured spoon rather than inventing new dimensions", () => {
  const f = fixture(),
    inventory = getTablewareInventory(f.room, f.plan, f.documents)
  if (inventory instanceof Error) throw inventory
  const boxes = getPlaceSettingBoxes({ inventory, plan: f.plan, documents: f.documents })
  if (boxes instanceof Error) throw boxes
  const spoon = boxes.find((box) => box.id === "spoon-1")
  expect(spoon?.size).toEqual([0.035, 0.012, 0.18])
})
it("rejects the original far position and a sleeve through the table", () => {
  const f = fixture(),
    chair = f.room.furniture?.find((furniture) => furniture.symbol === "A")
  if (!chair?.seat) throw new Error("Missing native dining seat")
  chair.seat.occupant_forward_m = 0
  f.plan.places[0].items[0].position_m = [0.17, 0.12]
  expect(getPlaceReachError(f.room, f.plan, f.documents)?.message).toContain("unreachable without stretching the arm")
  chair.seat.occupant_forward_m = 0.1
  f.plan.places[0].items[0].position_m = [0.17, 0.02]
  const review = f.plan.places[0].reach_review
  if (!review) throw new Error("Missing reach review")
  review.elbow_swivel = undefined
  review.lift = undefined
  review.advance = undefined
  review.pole = [-1, 0, 0]
  expect(getPlaceReachError(f.room, f.plan, f.documents)?.message).toContain("arm or cuff intersects tableware or the table")
})

it("rejects a withdrawal target outside the unchanged native arm's reach", () => {
  const f = fixture(),
    withdrawal = f.plan.places[0].reach_review?.withdrawal
  if (!withdrawal) throw new Error("Missing planned hand withdrawal")
  withdrawal.seat_target_m = [-2, 0.44, -0.05]
  expect(getPlaceReachError(f.room, f.plan, f.documents)?.message).toContain("Seated arm segment is unreachable without stretching")
})

it("requires withdrawal and swivel before a lift and rejects the old colliding advance", () => {
  const f = fixture(),
    review = f.plan.places[0].reach_review
  if (!review) throw new Error("Missing authored motion stages")
  review.elbow_swivel = undefined
  expect(tablePlaceSettingsSchema.safeParse(f.plan).success).toBe(false)
  review.elbow_swivel = { scope: "fixed_grip_pole_segment", status: "unverified" }
  const table = f.room.furniture?.find((furniture) => furniture.symbol === "T")
  if (!table?.work_surface || !review.lift) throw new Error("Missing former direct-advance geometry")
  // Reproduce the former table-only route, including its unchanged native resting arms.
  review.rest = undefined
  table.work_surface.height_m = 0.66
  f.plan.places[0].items[0].position_m = [0.17, 0.02]
  f.plan.places[0].items[1].position_m = [0.06, 0.02]
  review.hover_above_m = 0.12
  review.lift.seat_target_m = [-0.28, 0.84, -0.05]
  review.lift.pole = undefined
  review.advance = undefined
  review.pole = [-1, 1, 0]
  expect(getPlaceReachError(f.room, f.plan, f.documents)?.message).toContain("Seated arm continuous clearance remains unresolved")
})

it("rejects an advance without a connected lift in both the metadata and direct operation boundary", () => {
  const f = fixture(),
    review = f.plan.places[0].reach_review
  if (!review?.advance) throw new Error("Missing planned advance")
  review.lift = undefined
  expect(tablePlaceSettingsSchema.safeParse(f.plan).success).toBe(false)
  expect(getPlaceReachError(f.room, f.plan, f.documents)?.message).toContain("Hand advance has no lift endpoint")
})

it("rejects the former high lifting pole when the forearm approaches the diner", () => {
  const f = fixture(),
    lift = f.plan.places[0].reach_review?.lift
  if (!lift) throw new Error("Missing planned lift")
  lift.pole = [-1, 3, 0]
  expect(getPlaceReachError(f.room, f.plan, f.documents)?.message).toContain("hand lift: frame 0: Seated arm continuous clearance remains unresolved")
})
it("rejects a direct diagonal shortcut from the lifted hand to the bowl", () => {
  const f = fixture(),
    review = f.plan.places[0].reach_review
  if (!review) throw new Error("Missing reach review")
  review.advance = undefined
  expect(getPlaceReachError(f.room, f.plan, f.documents)?.message).toContain("bowl-1: frame 0: Seated arm continuous clearance remains unresolved")
})
