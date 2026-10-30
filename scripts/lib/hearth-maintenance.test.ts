import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditHearthMaintenance } from "#/scripts/lib/hearth-maintenance"
const read = (id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/rooms/room-${id}-1.md`, import.meta.url), "utf8"))
it("fits the full maintenance body and reaches the firebox back in both rooms", () => {
  for (const id of ["h10", "h-m5"]) {
    const room = read(id),
      operation = room.furniture!.find((f) => f.hearth_maintenance)!.hearth_maintenance!
    expect(auditHearthMaintenance(room)).toEqual([])
    // Shorten the same object in storage and use; keep its identity consistent.
    operation.tool.length_m = 0.5
    const rack = room.furniture!.find((f) => f.symbol === operation.tool.storage!.furniture)!
    ;(rack.shelf as { contents: { height_m: number }[] }).contents[0].height_m = 0.5
    expect(auditHearthMaintenance(room)).toContain(`${id === "h10" ? "F" : "H"}: Maintenance tool cannot reach the firebox back`)
  }
})
it("rejects standing in masonry and a tool wider than the opening", () => {
  const room = read("h-m5"),
    f = room.furniture!.find((f) => f.hearth_maintenance)!,
    op = f.hearth_maintenance!
  f.use_space![0].rect = [9, 2, 3, 3]
  op.body_m = [5.25, 1.5]
  expect(auditHearthMaintenance(room)).toContain("H: Maintenance body intersects furniture")
  f.use_space![0].rect = [9, 3, 3, 2]
  op.body_m = [5.25, 2]
  op.tool.blade_width_m = 1
  expect(auditHearthMaintenance(room)).toContain("H: Maintenance tool does not fit the firebox opening")
})

it("does not pass the design gate with unresolved tool storage or allow work in a burning hearth", () => {
  const room = read("h-m5"),
    op = room.furniture!.find((f) => f.hearth_maintenance)!.hearth_maintenance!
  room.design_gate = "通過"
  expect(auditHearthMaintenance(room)).toContain("H: Hearth maintenance tool storage is unverified")
  room.design_gate = "未通過"
  Object.assign(op, { state: "hot" })
  expect(auditHearthMaintenance(room)).toContain("H: Hearth maintenance requires a cold empty firebox")
})

it("rejects a reachable grip whose insertion line strikes the stone beside the mouth", () => {
  const room = read("h-m5"),
    f = room.furniture!.find((f) => f.hearth_maintenance)!,
    op = f.hearth_maintenance!
  f.use_space![0].rect = [9, 3, 3, 2]
  op.body_m = [5.25, 2]
  op.grip_m = [5.9, 1.6]
  expect(auditHearthMaintenance(room)).toContain("H: Maintenance tool path clips the firebox opening")
  op.grip_m = [8, 2]
  expect(auditHearthMaintenance(room)).toContain("H: Maintenance grip is beyond hand reach")
})

it("binds the maintenance tool to the actual stored tool dimensions", () => {
  const room = read("h-m5"),
    tool = room.furniture!.find((f) => f.hearth_maintenance)!.hearth_maintenance!.tool
  tool.length_m = 0.9
  expect(auditHearthMaintenance(room)).toContain("H: Maintenance tool does not match its stored object")
  tool.storage!.item = "missing"
  expect(auditHearthMaintenance(room)).toContain("H: Maintenance tool does not match its stored object")
})
