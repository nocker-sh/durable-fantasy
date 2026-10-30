import { ashLidRestPlan } from "#/scripts/lib/ash-lid-rest-plan"
import { shelfDimensions } from "./shelf-dimensions"
import { storageRetrieval } from "../../world/town/storage-retrieval"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditAshReceivers } from "./ash-receiver"
import { auditStorageRetrieval } from "#/scripts/lib/audit-storage-retrieval"
function fixture() {
  const read = (kind: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${id}.md`, import.meta.url), "utf8")),
    room = read("rooms", "room-h-m5-1"),
    building = read("buildings", "building-h-m5"),
    op = room.furniture!.find((f) => f.hearth_maintenance)!.hearth_maintenance!,
    receiver = op.ash_receiver!,
    rack = room.furniture!.find((f) => f.symbol === receiver.storage.furniture)!,
    raw = rack.shelf as { contents: Record<string, unknown>[] }
  const documents = new Map((building.rooms as string[]).map((id) => [id, id === room.id ? room : read("rooms", id)]))
  const lidPlan = () => {
    const k = room.grid!.cell_m,
      [x, z, w, d] = rack.rect.map((n) => n * k),
      shelf = shelfDimensions(rack.shelf, w, d),
      item = shelf.items![0],
      motion = storageRetrieval({ x: x + w / 2, z: z + d / 2, width: w, depth: d, shelf: shelf, index: 0 })
    return ashLidRestPlan({ room: room, building: building, documents: documents, rack: rack, shelf: shelf, item: item, motion: motion, rest: receiver.lid_rest })
  }
  return { room, building, documents, op, receiver, rack, raw, lidPlan, check: () => auditAshReceivers(room, building, documents) }
}
it("joins the actual iron box withdrawal to a clear indoor doorway approach without clearing the design gate", () => {
  const f = fixture()
  expect(f.check()).toEqual([])
  expect(auditStorageRetrieval(f.room, f.building)).toEqual([])
  expect(f.receiver.status).toBe("unverified")
  expect(f.room.design_gate).toBe("未通過")
})
it("rejects a wooden receiver, a missing lid and capacity above the real cavity", () => {
  const f = fixture()
  f.raw.contents[0].box_material = "wood"
  expect(f.check()).toContain("H: Ash receiver must be an explicitly lidded iron box")
  f.raw.contents[0].box_material = "iron"
  const lift = f.raw.contents[0].lid_lift_m
  delete f.raw.contents[0].lid_lift_m
  expect(f.check()).toContain("H: Ash receiver must be an explicitly lidded iron box")
  f.raw.contents[0].lid_lift_m = lift
  f.receiver.capacity_l = 100
  expect(f.check()).toContain("H: Ash receiver capacity exceeds its usable cavity")
})
it("rejects a shortcut through classroom furniture even when the route ends at the right door", () => {
  const f = fixture()
  f.receiver.door_approach.poses.splice(1, 2, { body_m: [4.5, 7], turn: 0 })
  expect(f.check()).toContain("H: Carry body crosses a wall, door or furniture")
})
it("rejects disconnected withdrawal, wrong doorway and a carry above the ceiling", () => {
  const f = fixture(),
    path = f.receiver.door_approach
  path.poses[0].body_m[0] += 0.1
  expect(f.check()).toContain("H: Ash receiver path does not join its storage withdrawal")
  path.poses[0].body_m[0] -= 0.1
  path.target = "room-h-m5-lower-stairs"
  expect(f.check()).toContain("H: Ash receiver needs its exterior doorway")
  path.target = "map-phanthiet-market"
  path.carry_bottom_m = 3
  expect(f.check()).toContain("H: Ash receiver carry lacks vertical clearance")
})
it("requires a receiver before a design gate can pass and refuses to certify the unfinished operation", () => {
  const f = fixture()
  f.room.design_gate = "通過"
  expect(f.check()).toContain("H: Ash receiver's unverified operation must retain the design gate")
  delete f.op.ash_receiver
  expect(f.check()).toContain("H: Ash receiver is missing")
})

it("rejects a flat ungrippable ash lid instead of treating its height as a handle", () => {
  const f = fixture()
  delete f.raw.contents[0].lid_handle
  expect(f.check()).toContain("H: Ash receiver lid needs an explicit grip handle")
})

it("rejects putting the lid on a teaching table or partly outside its dedicated shelf", () => {
  const f = fixture()
  f.receiver.lid_rest.furniture = "E"
  expect(f.check()).toContain("H: Ash lid needs its dedicated shelf top and floor support")
  f.receiver.lid_rest.furniture = "R"
  f.receiver.lid_rest.position_m = [5.5, 6.16]
  expect(f.check()).toContain("H: Ash lid is not fully supported by its shelf top")
})
it("keeps the former short lid lift unresolved instead of passing through the shelf", () => {
  const f = fixture()
  f.raw.contents[0].lid_lift_m = 0.08
  expect(f.check()).toContain("H: Lid lift does not clear its rest support")
})

it("removes the withdrawn receiver from its old storage volume instead of leaving a duplicate", () => {
  const f = fixture(),
    { section } = f.lidPlan(),
    k = f.room.grid!.cell_m,
    [x, z, w, d] = f.rack.rect.map((n) => n * k),
    shelf = shelfDimensions(f.rack.shelf, w, d),
    motion = storageRetrieval({ x: x + w / 2, z: z + d / 2, width: w, depth: d, shelf: shelf, index: 0 }),
    p = motion.from,
    centre = [(p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, (p.z0 + p.z1) / 2]
  expect(section.obstacles.some((b) => centre[0] > b.x0 && centre[0] < b.x1 && centre[1] > b.bottom && centre[1] < b.top && centre[2] > b.z0 && centre[2] < b.z1)).toBe(false)
})

it("rejects an unresolvable door before certifying either the carry or lid movement", () => {
  const f = fixture()
  const leaves = f.room.door_leaves as { door: number[] }[]
  leaves[0].door = [3, 3]
  expect(f.check()).toContain("H: Room has an invalid door leaf")
  expect(() => f.lidPlan()).toThrow("Room has an invalid door leaf")
})

it("checks lifting the closed box to carry height instead of checking only the ceiling", () => {
  const f = fixture()
  ;(f.room.lamps as unknown[]).push({ position_m: [5.145, 6.25], bottom_m: 0.55, diameter_m: 0.02 })
  expect(() => f.lidPlan()).not.toThrow()
  expect(f.check()).toContain("H: Storage box movement intersects an obstacle")
})

it("does not pass under a low hanging obstruction elsewhere on the indoor carry route", () => {
  const f = fixture()
  ;(f.room.lamps as unknown[]).push({ position_m: [4, 6.25], bottom_m: 0.55, diameter_m: 0.02 })
  expect(() => f.lidPlan()).not.toThrow()
  expect(f.check()).toContain("H: Carry body crosses a wall, door or furniture")
})

it("rejects a receiving position inside classroom furniture", () => {
  const f = fixture()
  f.receiver.receiving.position_m = [1.75, 3.75]
  expect(f.check()).toContain("H: Ash receiver movement intersects an obstacle")
})

it("requires the empty-box approach to join pickup and go around the classroom tables", () => {
  const f = fixture(),
    poses = f.receiver.receiving.approach.poses
  f.receiver.receiving.approach.poses = [poses[0], poses[poses.length - 1]]
  expect(f.check()).toContain("H: Carry body crosses a wall, door or furniture")
  f.receiver.receiving.approach.poses = structuredClone(poses)
  f.receiver.receiving.approach.poses[0][0] += 0.1
  expect(f.check()).toContain("H: Upright storage approach does not join its pickup")
})
it("includes hanging obstructions on the separate empty-box approach", () => {
  const f = fixture()
  ;(f.room.lamps as unknown[]).push({ position_m: [3.85, 4.8], bottom_m: 0.55, diameter_m: 0.02 })
  expect(f.check()).toContain("H: Carried empty ash receiver crosses a wall, door or furniture")
})

it("rejects a grip candidate moved back to the unreachable withdrawal position", () => {
  const f = fixture()
  f.receiver.receiving.grip_candidate.body_m = [...f.receiver.receiving.approach.poses[0]]
  expect(f.check()).toContain("H: Left box grip is unreachable without stretching the arm")
})
