import { expect, it } from "vitest"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditHouseholdMeals } from "#/scripts/lib/household-meals"
function fixture() {
  const base = { status: "設計中", source: "test", design_gate: "未通過", issues: [] }
  const documents = new Map<string, SettingDocument>([
    ["building-home", { ...base, id: "building-home", kind: "buildings", title: "家", residents: ["resident-a", "resident-b"] }],
    ["resident-a", { ...base, id: "resident-a", kind: "residents", title: "アントン" }],
    ["resident-b", { ...base, id: "resident-b", kind: "residents", title: "ベルタ" }],
    [
      "room-dining",
      {
        ...base,
        id: "room-dining",
        kind: "rooms",
        title: "台所",
        building: "building-home",
        occupants: ["アントン", "ベルタ"],
        grid: { cell_m: 0.5, rows: ["........", "........", "........", "........"] },
        furniture: [
          { symbol: "T", role: "table", name: "食卓", owner: "世帯", source: "木工所", rect: [2, 2, 3, 1], access: [[1, 2]], seat_symbols: ["A", "B"] },
          { symbol: "A", name: "椅子", owner: "世帯", source: "木工所", rect: [2, 1, 1, 1], access: [[1, 1]], role: "seat" },
          { symbol: "B", name: "椅子", owner: "世帯", source: "木工所", rect: [4, 1, 1, 1], access: [[5, 1]], role: "seat" },
        ],
        household_meal: {
          table: "T",
          seats: [
            { resident: "resident-a", chair: "A" },
            { resident: "resident-b", chair: "B" },
          ],
        },
      },
    ],
  ])
  const room = documents.get("room-dining")!,
    meal = room.household_meal as { table: string; seats: { resident: string; chair: string }[] }
  return { documents, room, meal, audit: () => auditHouseholdMeals(documents) }
}
it("assigns every household member a physical dining chair", () => {
  expect(fixture().audit()).toEqual([])
})
it("rejects missing diners and shared chairs", () => {
  const f = fixture()
  f.meal.seats.pop()
  expect(f.audit()).toContain("room-dining: household meal does not seat every member exactly once")
  f.meal.seats.push({ resident: "resident-b", chair: "A" })
  expect(f.audit()).toContain("room-dining: household meal shares a chair")
})
it("does not seat a nonresident employee instead of a family member", () => {
  const f = fixture()
  f.meal.seats[1].resident = "resident-employee"
  f.documents.set("resident-employee", { ...f.documents.get("resident-a")!, id: "resident-employee", title: "職人" })
  expect(f.audit()).toContain("room-dining: diner does not belong to this home and room")
})
it("requires a real seat attached to the specified dining surface", () => {
  const f = fixture()
  f.room.furniture![0].seat_symbols = ["A"]
  expect(f.audit()).toContain("room-dining: diner has no chair at the dining surface")
  f.meal.table = "A"
  expect(f.audit()).toContain("room-dining: household meal has no dining surface")
})
it("detects occupants crowded at adjacent seat centres", () => {
  const f = fixture()
  f.room.furniture![2].rect = [3, 1, 1, 1]
  expect(f.audit()).toContain("room-dining: dining seat centres crowd the occupants")
})
it("leaves unplanned dining rooms unresolved without inventing seats", () => {
  const f = fixture()
  delete f.room.household_meal
  expect(f.audit()).toEqual([])
  expect(f.room.household_meal).toBeUndefined()
})
it("does not pass a completed home with no household dining plan", () => {
  const f = fixture(),
    building = f.documents.get("building-home")!
  building.design_gate = "通過"
  building.rooms = [f.room.id]
  expect(f.audit()).toEqual([])
  delete f.room.household_meal
  expect(f.audit()).toContain("building-home: completed household has no dining plan")
})
it("does not borrow a dining plan from another home", () => {
  const f = fixture(),
    building = f.documents.get("building-home")!
  building.design_gate = "通過"
  building.rooms = [f.room.id]
  f.room.building = "building-other"
  expect(f.audit()).toContain("building-home: completed household has no dining plan")
})

it("does not use a bed, shelf or fire as a dining surface by attaching chairs to it", () => {
  for (const role of ["bed", "storage", "hearth", undefined]) {
    const f = fixture()
    f.room.furniture![0].role = role
    expect(f.audit()).toContain("room-dining: household meal has no dining surface")
  }
})

it("ties staggered meals to every resident's routine without assuming everyone eats at once", () => {
  const f = fixture()
  f.room.meal_service = { mode: "staggered", routine_source: "world/town/routines.ts" }
  expect(f.audit()).toContain("room-dining: Staggered meal has no matching resident routine source: resident-a")
  expect(f.audit()).toContain("room-dining: Staggered meal has no matching resident routine source: resident-b")
  for (const id of ["resident-a", "resident-b"]) f.documents.get(id)!.routine_source = { file: "world/town/routines.ts" }
  expect(f.audit()).toEqual([])
  f.documents.get("resident-b")!.routine_source = { file: "old-routine.ts" }
  expect(f.audit()).toContain("room-dining: Staggered meal has no matching resident routine source: resident-b")
})
