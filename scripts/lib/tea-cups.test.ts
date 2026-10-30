import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import { getCupDefinition } from "#/scripts/lib/get-cup-definition"
import { getDishDryingBatches } from "#/scripts/lib/get-dish-drying-batches"
import { getDryingDish } from "#/scripts/lib/get-drying-dish"
import { getDishDryingError } from "#/scripts/lib/get-dish-drying-error"
import { getDishStorageError } from "#/scripts/lib/get-dish-storage-error"
import { getTablewareGroup } from "#/scripts/lib/get-tableware-group"
const fixture = () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-2.md", import.meta.url), "utf8")),
    plan = dishDryingSchema.parse(room.dish_drying),
    cups = plan.items.filter((item) => item.kind === "cup")
  return { room, plan, cups }
}
it("keeps two individually owned cups in their covered box and their own sequential drying group", () => {
  const f = fixture(),
    batches = getDishDryingBatches(f.plan)
  if (batches instanceof Error) throw batches
  expect(f.cups.map((cup) => cup.owner)).toEqual(["ヴィルヘルム", "ゾフィー"])
  expect(batches.map((batch) => batch.length)).toEqual([4, 2])
  expect(getDishDryingError(f.room, f.plan)).toBeNull()
  expect(getDishStorageError(f.room, f.plan)).toBeNull()
  expect(getTablewareGroup(f.plan, "meal-dishes")).toHaveLength(4)
  expect(getTablewareGroup(f.plan, null)).toEqual(new Error("Meal tableware has no named source group"))
  expect(getTablewareGroup(f.plan, "missing")).toBeInstanceOf(Error)
})
it("retains the off-centre body ring and the full handle envelope for each cup", () => {
  const f = fixture()
  for (const item of f.cups) {
    const cup = getCupDefinition(item),
      dish = getDryingDish(item)
    if (cup instanceof Error) throw cup
    if (dish instanceof Error) throw dish
    expect(dish.rimCenter).toEqual(cup.centre)
    expect(cup.centre[0]).not.toBe(item.width_m / 2)
    expect(dish.rimRadius).toBe(cup.bowl.rimContactRadius)
    expect(cup.bowl.capacity * 1000).toBeGreaterThan(0.3)
    expect(cup.bowl.capacity * 1000).toBeLessThan(0.4)
    expect(cup.handle).toHaveLength(3)
    expect(getCupDefinition({ ...item, width_m: item.width_m - 0.01 })).toEqual(new Error("Cup handle or body disagrees with its outer bounds"))
  }
})
it("refuses omitted, duplicate and unknown batch membership rather than dropping unplaced objects", () => {
  const f = fixture(),
    batches = f.plan.batches
  if (!batches) throw new Error("Missing authored drying groups")
  batches.groups[1].item_ids.pop()
  expect(getDishDryingBatches(f.plan)).toEqual(new Error("Drying groups omit an inventory object"))
  batches.groups[1].item_ids.push("cup-sophie", "cup-wilhelm")
  expect(getDishDryingBatches(f.plan)).toEqual(new Error("Drying group has an unknown or repeated object"))
  batches.groups[1].item_ids = ["cup-wilhelm", "unplaced-cup"]
  expect(getDishDryingBatches(f.plan)).toEqual(new Error("Drying group has an unknown or repeated object"))
  batches.groups[1].id = batches.groups[0].id
  expect(getDishDryingBatches(f.plan)).toEqual(new Error("Invalid or repeated drying group"))
})
it("retains same-batch clearance and refuses pretending both groups fit simultaneously", () => {
  const f = fixture()
  expect(getDishDryingError(f.room, { ...f.plan, batches: undefined })).toBeInstanceOf(Error)
  f.cups[1].drying_position_m = [...f.cups[0].drying_position_m]
  expect(getDishDryingError(f.room, f.plan)).toBeInstanceOf(Error)
})
