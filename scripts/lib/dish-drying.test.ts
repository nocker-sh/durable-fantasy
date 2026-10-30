import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { auditDishDrying } from "#/scripts/lib/audit-dish-drying"
import { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import { readSetting } from "#/scripts/lib/read-setting"
import { getDishStorageError } from "#/scripts/lib/get-dish-storage-error"
import { getDishDryingError } from "#/scripts/lib/get-dish-drying-error"

const readKitchen = () => readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-2.md", import.meta.url), "utf8"))

it("fits the same two bowls and two spoons on the grid and inside solid-walled boxes", () => {
  const room = readKitchen()
  const plan = dishDryingSchema.parse(room.dish_drying)
  expect(plan.items.filter((item) => item.kind === "bowl")).toHaveLength(2)
  expect(plan.items.filter((item) => item.kind === "spoon")).toHaveLength(2)
  expect(auditDishDrying(room)).toEqual([])
})
it("rejects a bowl left upright or overlapping another drying dish", () => {
  const room = readKitchen(),
    plan = dishDryingSchema.parse(room.dish_drying)
  plan.items[0].drying_orientation = "flat"
  expect(getDishDryingError(room, plan)).toEqual(new Error("Drying bowls must drain upside down"))
  plan.items[0].drying_orientation = "inverted"
  plan.items[2].drying_position_m = plan.items[0].drying_position_m
  expect(getDishDryingError(room, plan)).toBeInstanceOf(Error)
})
it("rejects fictitious nesting and a dish outside the storage interior", () => {
  const room = readKitchen(),
    plan = dishDryingSchema.parse(room.dish_drying)
  plan.items[2].storage.box = plan.items[0].storage.box
  plan.items[2].storage.position_m[1] = 0.03
  expect(getDishStorageError(room, plan)).toBeInstanceOf(Error)
  plan.items[2].storage.position_m = [0.2, 0, 0.055]
  expect(getDishStorageError(room, plan)).toBeInstanceOf(Error)
})
it("rejects trays wider than their support and missing washing or storage furniture", () => {
  const room = readKitchen(),
    plan = dishDryingSchema.parse(room.dish_drying)
  plan.tray.width_m = 0.6
  expect(getDishDryingError(room, plan)).toEqual(new Error("Drying tray or grid leaves its support"))
  plan.washed_at = "Q"
  expect(getDishDryingError(room, plan)).toEqual(new Error("Dish drying has no washing basin"))
  plan.dry_storage = "Z"
  expect(getDishStorageError(room, plan)).toEqual(new Error("Drying dishes have no storage shelf"))
})
it("rejects malformed metadata and retains the proposed design gate", () => {
  const room = readKitchen()
  room.design_gate = "通過"
  expect(auditDishDrying(room)).toContain("room-h1-2: Dish drying operation remains proposed")
  room.dish_drying = { status: "proposed" }
  expect(auditDishDrying(room)).toContain("room-h1-2: Invalid dish drying plan")
})

it("rejects a submerged grid, oversized gaps and unresolved storage IDs", () => {
  const room = readKitchen(),
    plan = dishDryingSchema.parse(room.dish_drying)
  plan.grid.frame_bottom_above_tray_floor_m = 0.01
  expect(getDishDryingError(room, plan)).toEqual(new Error("Drying grid is below the tray rim"))
  plan.grid.frame_bottom_above_tray_floor_m = 0.03
  plan.grid.gap_m = 0.2
  expect(getDishDryingError(room, plan)).toEqual(new Error("Drying dish can fall between grid bars"))
  plan.items[0].storage.box = "missing-box"
  expect(getDishStorageError(room, plan)).toEqual(new Error("Drying dishes have no storage box missing-box"))
})

it("places each resident's bowl and spoon directly on a separate box floor", () => {
  const room = readKitchen(),
    plan = dishDryingSchema.parse(room.dish_drying)
  for (const owner of ["ヴィルヘルム", "ゾフィー"]) {
    const owned = plan.items.filter((item) => item.owner === owner && item.kind !== "cup")
    expect(owned).toHaveLength(2)
    expect(new Set(owned.map((item) => item.storage.box)).size).toBe(1)
    for (const item of owned) expect(item.storage.position_m[1]).toBe(0)
  }
  expect(plan.items[0].storage.box).not.toBe(plan.items[2].storage.box)
  plan.items[0].storage.position_m[1] = 0.01
  expect(getDishStorageError(room, plan)).toEqual(new Error("Stored dish has no floor contact"))
})
it("rejects a round bowl whose hollow or measured outer bounds disagree", () => {
  const room = readKitchen(),
    plan = dishDryingSchema.parse(room.dish_drying)
  plan.items[0].depth_m = 0.17
  expect(getDishDryingError(room, plan)).toEqual(new Error("Bowl shape does not match its round outer bounds"))
  plan.items[0].depth_m = 0.16
  const bowl = plan.items[0].bowl
  if (!bowl) throw new Error("Missing bowl profile")
  bowl.bottom_m = 0.06
  expect(getDishDryingError(room, plan)).toEqual(new Error("Bowl has no usable hollow or flat base"))
})

it("rejects one-sided contact even when the bar gap is narrower than the bowl", () => {
  const room = readKitchen(),
    plan = dishDryingSchema.parse(room.dish_drying)
  plan.grid.gap_m = 0.14

  expect(getDishDryingError(room, plan)).toEqual(new Error("bowl-1: Grid contacts do not enclose the bowl center with its support margin"))
})
