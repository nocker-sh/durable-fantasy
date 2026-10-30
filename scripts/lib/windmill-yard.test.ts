import { getWindmillYardRotorError } from "#/scripts/lib/get-windmill-yard-rotor-error"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditWindmillYard } from "#/scripts/lib/audit-windmill-yard"
import { windmillYardSchema } from "#/scripts/lib/windmill-yard-schema"
import { getWindmillYardBoundaryErrors } from "#/scripts/lib/get-windmill-yard-boundary-errors"
const fixture = () => readSetting(readFileSync(".docs/settings/facilities/facility-square-windmill.md", "utf8"))
const changeCell = (row: string, column: number, symbol: string) => row.slice(0, column) + symbol + row.slice(column + 1)
it("keeps the unplaced machine reservation separate from covered grain, flour and receiving work", () => {
  const document = fixture(),
    before = JSON.stringify(document)
  expect(auditWindmillYard(document)).toEqual([])
  expect(document.design_gate).toBe("未通過")
  expect(JSON.stringify(document)).toBe(before)
  document.design_gate = "通過"
  expect(auditWindmillYard(document)).toContain("Unplaced windmill yard cannot clear the facility design gate")
})
it("rejects a gap or an extra opening in the machine enclosure", () => {
  for (const symbol of [".", "D"]) {
    const document = fixture()
    if (!document.grid) throw new Error("Missing yard grid")
    document.grid.rows[0] = changeCell(document.grid.rows[0], 2, symbol)
    expect(auditWindmillYard(document)).toContain("Machine enclosure boundary disagrees with its gate reservation")
  }
})
it("rejects duplicated, disconnected or too-narrow gate reservations and an enclosure outside the grid", () => {
  const document = fixture(),
    plan = windmillYardSchema.parse(document.windmill_yard)
  if (!document.grid) throw new Error("Missing yard grid")
  for (const cells of [
    [
      [9, 11],
      [9, 11],
    ],
    [
      [9, 11],
      [11, 11],
    ],
    [
      [9, 10],
      [10, 10],
    ],
  ] satisfies [number, number][][])
    expect(getWindmillYardBoundaryErrors({ grid: document.grid, plan: { ...plan, gate: { ...plan.gate, cells } } })).toEqual(["Machine enclosure has no contiguous usable south gate"])
  expect(getWindmillYardBoundaryErrors({ grid: { ...document.grid, cell_m: 0.2 }, plan })).toEqual(["Machine enclosure has no contiguous usable south gate"])
  expect(getWindmillYardBoundaryErrors({ grid: document.grid, plan: { ...plan, enclosure_rect: [0, 0, document.grid.rows[0].length + 1, 12] } })).toEqual(["Machine enclosure leaves the yard grid"])
})
it("rejects grain and its operating floor moved into the machine reservation", () => {
  const document = fixture(),
    store = document.furniture?.find((piece) => piece.symbol === "R")
  if (!document.grid || !store) throw new Error("Missing grain store")
  for (const y of [14, 15]) for (const x of [1, 2, 3, 4]) document.grid.rows[y] = changeCell(document.grid.rows[y], x, ".")
  for (const y of [5, 6]) for (const x of [2, 3, 4, 5]) document.grid.rows[y] = changeCell(document.grid.rows[y], x, "R")
  store.rect = [2, 5, 4, 2]
  store.access = [
    [2, 7],
    [3, 7],
  ]
  store.use_space = [{ activity: "麦の取出し", rect: [2, 7, 4, 2] }]
  expect(auditWindmillYard(document)).toContain("R: food storage or receiving work enters the machine enclosure")
})
it("requires distinct covered stores and all three gate-entry conditions", () => {
  const document = fixture(),
    plan = windmillYardSchema.parse(document.windmill_yard)
  document.windmill_yard = { ...plan, covered_stores: [plan.covered_stores[0], plan.covered_stores[0]] }
  expect(auditWindmillYard(document)).toContain("Grain and flour need distinct covered stores")
  document.windmill_yard = { ...plan, gate: { ...plan.gate, access_requires: { ...plan.gate.access_requires, rotor_locked: false } } }
  expect(auditWindmillYard(document)).toEqual(["Invalid windmill yard proposal"])
})

it("rejects the former narrow enclosure using the real complete rotor and its declared gap", () => {
  const document = fixture(),
    plan = windmillYardSchema.parse(document.windmill_yard)
  expect(getWindmillYardRotorError({ document, plan })).toBeNull()
  const machine = document.furniture?.find((piece) => piece.symbol === plan.machine)
  if (!machine) throw new Error("Missing machine reservation")
  machine.rect = [6, 2, 8, 8]
  expect(getWindmillYardRotorError({ document, plan: { ...plan, enclosure_rect: [0, 0, 20, 12] } })).toEqual(new Error("Complete windmill rotor sweep leaves the enclosed reservation"))
})
it("retains metre conversion, the floor and clearance when checking a rotor reservation", () => {
  const document = fixture(),
    plan = windmillYardSchema.parse(document.windmill_yard)
  if (!document.grid) throw new Error("Missing yard grid")
  expect(getWindmillYardRotorError({ document, plan: { ...plan, rotor_review: { ...plan.rotor_review, clearance_m: 1 } } })).toBeInstanceOf(Error)
  expect(getWindmillYardRotorError({ document, plan: { ...plan, rotor_review: { ...plan.rotor_review, ground_m: -2 } } })).toEqual(new Error("Windmill rotor sweep reaches below the proposed ground"))
  document.grid.cell_m = 0.25
  expect(getWindmillYardRotorError({ document, plan })).toBeInstanceOf(Error)
})
