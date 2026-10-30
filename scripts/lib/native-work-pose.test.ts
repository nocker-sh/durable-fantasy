import { assertSettingShape } from "./setting-shape"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditNativeWorkPose } from "./native-work-pose"
function fixture(id: string) {
  const read = (kind: string, name: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${name}.md`, import.meta.url), "utf8"))
  const building = read("buildings", `building-${id}`),
    documents = new Map((building.rooms as string[]).map((name) => [name, read("rooms", name)])),
    room = documents.get(`room-${id}-1`)!,
    op = room.furniture!.find((f) => f.hearth_maintenance)!.hearth_maintenance!
  return { room, building, documents, op, check: () => auditNativeWorkPose(room, building, documents) }
}
it("proves static native body clearance in both source rooms", () => {
  for (const id of ["h10", "h-m5"]) expect(fixture(id).check()).toEqual([])
})
it("rejects the former distant body position instead of stretching the arm", () => {
  const f = fixture("h-m5")
  f.op.work_pose_candidate!.body_m = [5, 2.15]
  expect(f.check().some((s) => s.includes("unreachable"))).toBe(true)
})
it("rejects invalid animation frames and unknown operators", () => {
  const f = fixture("h10")
  f.op.work_pose_candidate!.frame = -1
  expect(f.check().some((s) => s.includes("frame"))).toBe(true)
  f.op.work_pose_candidate!.frame = 0
  f.op.operator = "resident-missing"
  expect(f.check().some((s) => s.includes("operator"))).toBe(true)
})

it("refuses a reachable pose moved into the masonry", () => {
  const f = fixture("h-m5")
  f.op.work_pose_candidate!.body_m[1] -= 0.3
  f.op.work_pose_candidate!.off_hand!.palm_m[2] -= 0.3
  expect(f.check().some((s) => s.includes("masonry clearance"))).toBe(true)
})

it("refuses furniture and walls intersecting the native body in both rooms", () => {
  for (const id of ["h10", "h-m5"]) {
    const f = fixture(id),
      k = f.room.grid!.cell_m,
      [x, z] = f.op.work_pose_candidate!.body_m
    const [dx, dz] = id === "h10" ? [-0.3, 0] : [0, 0.3]
    const obstruction = { ...f.room.furniture!.find((p) => !p.hearth_maintenance)!, symbol: "test-obstruction", rect: [(x + dx - 0.15) / k, (z + dz - 0.15) / k, 0.3 / k, 0.3 / k] }
    f.room.furniture!.push(obstruction)
    expect(
      f.check().some((s) => s.includes("surrounding clearance")),
      `${id}: ${f.check().join("; ")}`,
    ).toBe(true)
    f.room.furniture!.pop()
    const row = Math.floor(z / k),
      column = Math.floor(x / k),
      cells = [...f.room.grid!.rows[row]]
    cells[column] = "#"
    f.room.grid!.rows[row] = cells.join("")
    expect(
      f.check().some((s) => s.includes("surrounding clearance")),
      `${id}: ${f.check().join("; ")}`,
    ).toBe(true)
  }
})
it("requires a valid ceiling instead of accepting non-finite section bounds", () => {
  const f = fixture("h10")
  f.building.floor_levels = []
  expect(f.check().some((s) => s.includes("ceiling section"))).toBe(true)
})

it("refuses an open door leaf crossing the working body", () => {
  const f = fixture("h-m5"),
    door = [10, 0],
    row = [...f.room.grid!.rows[0]]
  for (let x = 10; x < 14; x++) row[x] = "D"
  f.room.grid!.rows[0] = row.join("")
  f.room.connections = [...(f.room.connections as object[]), { kind: "door", door, width_cells: 4 }]
  f.room.door_leaves = [...(f.room.door_leaves as object[]), { door, hinge: "start", waits_for: [], thickness_m: 0.06 }]
  expect(
    f.check().some((s) => s.includes("surrounding clearance")),
    f.check().join("; "),
  ).toBe(true)
})

it("does not silently omit a leaf without a valid doorway", () => {
  const f = fixture("h-m5")
  f.room.door_leaves = [...(f.room.door_leaves as object[]), { door: [10, 0], hinge: "start", waits_for: [], thickness_m: 0.06 }]
  expect(f.check().some((s) => s.includes("invalid door leaf"))).toBe(true)
})

it("rejects treating the raised shoe as a floor contact", () => {
  for (const id of ["h10", "h-m5"]) {
    const f = fixture(id)
    delete f.op.work_pose_candidate!.kneeling
    f.op.work_pose_candidate!.shoe_contacts = ["shoe_l", "shoe_r"]
    expect(f.check().some((s) => s.includes("shoe contacts do not match"))).toBe(true)
    f.op.work_pose_candidate!.shoe_contacts = ["shoe_r", "shoe_r"]
    expect(f.check().some((s) => s.includes("shoe contacts do not match"))).toBe(true)
  }
})

it("does not promote partial geometric checks to complete hand and self-contact verification", () => {
  const f = fixture("h10")
  delete f.op.work_pose_candidate!.stroke_clearance
  expect(f.check().some((s) => s.includes("unresolved hand and self-contact"))).toBe(true)
})

it("rejects the removed body-sliding mode in authored settings", () => {
  const f = fixture("h-m5")
  Object.assign(f.op.work_pose_candidate!, { stroke_motion: "translate_with_grip" })
  expect(() => assertSettingShape(f.room)).toThrow()
})

it("keeps the receiving box clear of the worker rather than checking an empty room", () => {
  const f = fixture("h-m5")
  f.op.ash_receiver!.receiving.position_m = [5.25, 1.9]
  expect(f.check().some((message) => message.includes("body surrounding clearance"))).toBe(true)
})
