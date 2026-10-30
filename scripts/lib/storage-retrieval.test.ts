import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { auditFurnitureUse } from "./furniture-use"
import { auditStorageRetrieval } from "#/scripts/lib/audit-storage-retrieval"
import { auditStorageRetrievals } from "#/scripts/lib/audit-storage-retrievals"
import { shelfDimensions } from "./shelf-dimensions"
import { storageBoxInterior } from "#/world/town/storage-box-interior"
const read = () => readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h10-2.md", import.meta.url), "utf8"))
function item(room: ReturnType<typeof read>) {
  return (room.furniture!.find((f) => f.symbol === "C")!.shelf as { contents: { retrieval: { withdraw_m: number; body_radius_m: number; body_start_m: number; body_end_m: number } }[] }).contents[0]
}
it("places reachable shallow personal storage and linen without blocking beds or stairs", () => {
  const room = read()
  expect(auditRoomGrid(room)).toEqual([])
  expect(auditFurnitureUse(room)).toEqual([])
  expect(auditStorageRetrieval(room)).toEqual([])
  for (const f of room.furniture!.filter((f) => ["C", "E"].includes(f.symbol))) {
    const s = shelfDimensions(f.shelf, f.rect[2] * 0.5, f.rect[3] * 0.5)
    expect(s.items).toHaveLength(3)
    for (const box of s.items!) {
      const usable = storageBoxInterior(box)
      expect(usable.width).toBeCloseTo(0.32)
      expect(usable.depth).toBeCloseTo(0.32)
      expect(usable.height).toBeCloseTo(0.215)
      expect(usable.volume).toBeLessThan(box.width * box.depth * box.height)
    }
  }
})
it("rejects a partial withdrawal or a body that retreats into the bed", () => {
  const short = read()
  item(short).retrieval.withdraw_m = 0.2
  expect(auditStorageRetrieval(short)).toContain("C: Stored object does not clear the shelf front")
  const backward = read()
  item(backward).retrieval.body_end_m = 2
  expect(auditStorageRetrieval(backward)).toContain("C/C-box-1: retrieval body leaves its operating space")
  const blocked = read(),
    bed = blocked.furniture!.find((f) => f.symbol === "A")!
  bed.rect = [8, 3, 2, 2]
  expect(auditStorageRetrieval(blocked)).toContain("C/C-box-1: retrieval body crosses a wall or furniture")
})
it("keeps the designed body size and hand reach instead of shrinking the operator", () => {
  const small = read()
  item(small).retrieval.body_radius_m = 0.1
  expect(auditStorageRetrieval(small)).toContain("C/C-box-1: retrieval body is smaller than the design width")
  const far = read()
  item(far).retrieval.body_start_m = 1.3
  expect(auditStorageRetrieval(far)).toContain("C/C-box-1: retrieval grip is out of reach")
  const wide = read(),
    linen = (wide.furniture!.find((f) => f.symbol === "F")!.shelf as { contents: { retrieval: { body_start_m: number } }[] }).contents[0]
  linen.retrieval.body_start_m = 0.7
  expect(auditStorageRetrieval(wide)).toContain("F/linen-1: retrieval grip is out of reach")
  const collision = read()
  item(collision).retrieval.body_end_m = 0.45
  expect(auditStorageRetrieval(collision)).toContain("C/C-box-1: retrieval body intersects the moving object")
})

it("rejects a rear box whose withdrawal crosses another stored box", () => {
  const room = read(),
    s = room.furniture!.find((f) => f.symbol === "C")!.shelf as { contents: { across_m: number; depth_m: number; from_back_m: number; retrieval?: unknown }[] }
  Object.assign(s.contents[0], { across_m: 0, depth_m: 0.15, from_back_m: 0.04 })
  Object.assign(s.contents[1], { across_m: 0, depth_m: 0.15, from_back_m: 0.25 })
  delete s.contents[1].retrieval
  expect(auditStorageRetrieval(room)).toContain("C/C-box-1: retrieval crosses another stored object")
})

it("requires a retrieval design before a room can pass its design gate", () => {
  const room = read(),
    s = room.furniture!.find((f) => f.symbol === "C")!.shelf as { contents: { retrieval?: unknown }[] }
  room.design_gate = "通過"
  delete s.contents[0].retrieval
  expect(auditStorageRetrieval(room)).toContain("C/C-box-1: stored object has no retrieval design")
  const missing = read(),
    box = (missing.furniture!.find((f) => f.symbol === "C")!.shelf as { contents: { lid_lift_m?: number }[] }).contents[0]
  missing.design_gate = "通過"
  delete box.lid_lift_m
  expect(auditStorageRetrieval(missing)).toContain("C/C-box-1: stored box lid movement is not designed")
})

it("checks the raised lid against the owning floor's ceiling after resolving the building", () => {
  const room = read(),
    building = readSetting(readFileSync(new URL("../../.docs/settings/buildings/building-h10.md", import.meta.url), "utf8")),
    documents = new Map([
      [room.id, room],
      [building.id, building],
    ])
  expect(auditStorageRetrievals(documents)).toEqual([])
  const box = (room.furniture!.find((f) => f.symbol === "C")!.shelf as { contents: { lid_lift_m: number }[] }).contents[0]
  box.lid_lift_m = 3
  expect(auditStorageRetrievals(documents)).toContain(`${room.id}: C/C-box-1: stored box lid reaches its ceiling`)
  box.lid_lift_m = 0.1
  room.design_gate = "通過"
  expect(auditStorageRetrieval(room)).toContain("C/C-box-1: stored box lid has no checked ceiling")
})
