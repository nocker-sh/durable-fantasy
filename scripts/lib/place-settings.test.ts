import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import { getPlaceSettingsError } from "#/scripts/lib/get-place-settings-error"
import { auditPlaceSettings } from "#/scripts/lib/audit-place-settings"
import { auditDesignDependencies } from "#/scripts/lib/design-dependencies"

const read = (path: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${path}.md`, import.meta.url), "utf8"))
const fixture = () => {
  const room = read("rooms/room-h1-1"),
    kitchen = read("rooms/room-h1-2")
  const documents = new Map([room, kitchen, read("buildings/building-h1"), read("residents/resident-ヴィルヘルム"), read("residents/resident-ゾフィー")].map((document) => [document.id, document]))
  const plan = tablePlaceSettingsSchema.parse(room.meal_place_settings)
  return { room, kitchen, documents, plan }
}
it("places the same measured kitchen objects at both named seats without changing the documents", () => {
  const f = fixture(),
    before = structuredClone([...f.documents])
  expect(auditPlaceSettings(f.room, f.documents)).toEqual([])
  expect([...f.documents]).toEqual(before)
})
it("rejects a shared or missing object instead of silently duplicating tableware", () => {
  const f = fixture()
  f.plan.places[0].items[1].id = f.plan.places[0].items[0].id
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Meal tableware is missing or assigned more than once"))
  f.plan.places[0].items.pop()
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Meal tableware is missing or assigned more than once"))
})
it("rejects a different owner's bowl or a chair outside the assigned place", () => {
  const f = fixture()
  f.plan.places[0].items[0].id = "bowl-2"
  f.plan.places[1].items[0].id = "bowl-1"
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Tabletop object does not belong to its diner"))
  f.plan.places[0].chair = "B"
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Tabletop settings do not match every assigned diner"))
})
it("rejects overlapping placements and an inverted eating bowl", () => {
  const f = fixture()
  f.plan.places[0].items[1].position_m = f.plan.places[0].items[0].position_m
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toBeInstanceOf(Error)
  f.plan.places[0].items[0].orientation = "flat"
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Tabletop object has an unsuitable orientation"))
})
it("reads changed dimensions from the kitchen and rejects a source from another home", () => {
  const f = fixture(),
    source = dishDryingSchema.parse(f.kitchen.dish_drying)
  source.items[0].width_m = 0.99
  f.kitchen.dish_drying = source
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Layout object bowl-1 leaves its container"))
  f.kitchen.building = "building-other"
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Meal tableware source is outside this home"))
})
it("retains the proposed operation gate and rejects malformed metadata", () => {
  const f = fixture()
  f.room.design_gate = "通過"
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Tabletop serving operation remains proposed")
  f.room.meal_place_settings = { status: "proposed" }
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Invalid tabletop place settings")
})
it("keeps the source kitchen as a design dependency", () => {
  const f = fixture()
  const otherKitchen = { ...f.kitchen, id: "room-h1-alternate-kitchen" }
  f.documents.set(otherKitchen.id, otherKitchen)
  f.room.meal_place_settings = { ...f.plan, source_room: otherKitchen.id }
  expect(auditDesignDependencies(f.documents)).toContain("room-h1-1: referenced prerequisite is missing from design dependencies: room-h1-alternate-kitchen")
})

it("rejects ambiguous source IDs before resolving the kitchen inventory", () => {
  const f = fixture(),
    source = dishDryingSchema.parse(f.kitchen.dish_drying)
  source.items[2].id = source.items[0].id
  f.kitchen.dish_drying = source
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Meal tableware source has duplicate object IDs"))
})

it("requires the complete named meal group after another service is added", () => {
  const f = fixture()
  f.plan.source_group = undefined
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Meal tableware has no named source group"))
  f.plan.source_group = "tea-cups"
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Meal tableware is missing or assigned more than once"))
  f.plan.source_group = "meal-dishes"
  f.plan.places[0].items.pop()
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Meal tableware is missing or assigned more than once"))
})

it("requires cups upright when checking a tea service's tabletop footprint", () => {
  const f = fixture(),
    source = dishDryingSchema.parse(f.kitchen.dish_drying)
  f.plan.source_group = "tea-cups"
  for (const place of f.plan.places) {
    const owner = f.documents.get(place.resident),
      cup = source.items.find((item) => item.kind === "cup" && item.owner === owner?.title)
    if (!cup) throw new Error("Missing owned tea cup")
    place.items = [{ ...place.items[0], id: cup.id, orientation: "upright" }]
  }
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toBeNull()
  f.plan.places[0].items[0].orientation = "flat"
  expect(getPlaceSettingsError(f.room, f.plan, f.documents)).toEqual(new Error("Tabletop object has an unsuitable orientation"))
})

it("checks the actual owned tea cups as a separate proposed service", () => {
  const f = fixture()
  const tea = tablePlaceSettingsSchema.parse(f.room.tea_place_settings)
  expect(tea.source_group).toBe("tea-cups")
  expect(getPlaceSettingsError(f.room, tea, f.documents)).toBeNull()
  tea.places[0].items[0].id = "cup-sophie"
  tea.places[1].items[0].id = "cup-wilhelm"
  f.room.tea_place_settings = tea
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Tabletop object does not belong to its diner")
})
it("rejects incomplete cups and a meal group masquerading as tea", () => {
  const f = fixture()
  const tea = tablePlaceSettingsSchema.parse(f.room.tea_place_settings)
  tea.places[1].items = []
  f.room.tea_place_settings = tea
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Invalid tabletop place settings")
  f.room.tea_place_settings = f.plan
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Tea service must use the complete cup group")
})
it("keeps the tea kitchen in the design dependencies even when the meal uses another source", () => {
  const f = fixture()
  const tea = tablePlaceSettingsSchema.parse(f.room.tea_place_settings)
  const teaKitchen = { ...f.kitchen, id: "room-h1-tea-kitchen" }
  f.documents.set(teaKitchen.id, teaKitchen)
  f.room.tea_place_settings = { ...tea, source_room: teaKitchen.id }
  expect(auditDesignDependencies(f.documents)).toContain("room-h1-1: referenced prerequisite is missing from design dependencies: room-h1-tea-kitchen")
})
it("reads cup dimensions from the kitchen and refuses an unfinished tea operation's completion", () => {
  const f = fixture()
  const source = dishDryingSchema.parse(f.kitchen.dish_drying)
  const cup = source.items.find((item) => item.id === "cup-wilhelm")
  if (!cup) throw new Error("Missing tea cup")
  cup.width_m = 2
  f.kitchen.dish_drying = source
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Layout object cup-wilhelm leaves its container")
  f.room.meal_place_settings = undefined
  f.room.design_gate = "通過"
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Tabletop serving operation remains proposed")
})
