import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditHearthCarry } from "#/scripts/lib/hearth-carry"
const read = (kind: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${id}.md`, import.meta.url), "utf8"))
function fixture(id: string) {
  const room = read("rooms", `room-${id}-1`),
    building = read("buildings", `building-${id}`),
    op = room.furniture!.find((f) => f.hearth_maintenance)!.hearth_maintenance!
  return { room, building, op }
}
it("joins withdrawal to maintenance with the upright tool clear throughout the outward and reverse route", () => {
  for (const id of ["h10", "h-m5"]) {
    const f = fixture(id)
    expect(auditHearthCarry(f.room, f.building)).toEqual([])
  }
})
it("rejects a shortcut through furniture and a route starting away from the held tool", () => {
  const f = fixture("h-m5"),
    poses = f.op.carry!.poses
  f.op.carry!.poses = [poses[0], poses[1], poses.at(-1)!]
  expect(auditHearthCarry(f.room, f.building)).toContain("H: Carry body crosses a wall, door or furniture")
  f.op.carry!.poses = structuredClone(poses)
  f.op.carry!.poses[0].body_m[0] += 0.1
  expect(auditHearthCarry(f.room, f.building)).toContain("H: Carry does not join storage withdrawal to hearth maintenance")
})
it("catches a tool hitting the south wall even when the carrier fits", () => {
  const f = fixture("h10")
  f.op.carry!.poses = f.op.carry!.poses.filter((_, i) => i !== 5).map((p) => ({ ...p, turn: 0 }))
  f.op.carry!.poses.push({ body_m: [4.4, 8.1], turn: 0 })
  f.op.handoff!.staging_body_m = [4.4, 8.1]
  expect(auditHearthCarry(f.room, f.building)).toContain("F: Carried tool crosses a wall, door or furniture")
})
it("requires a real turning position and room for the standing carrier", () => {
  const f = fixture("h10")
  f.op.carry!.poses[5].body_m[0] += 0.1
  f.op.handoff!.staging_body_m[0] += 0.1
  expect(auditHearthCarry(f.room, f.building)).toContain("F: Carry must turn in place")
  f.op.carry!.poses[5].body_m[0] -= 0.1
  f.op.handoff!.staging_body_m[0] -= 0.1
  ;(f.building.floor_levels as { floor: number; ceiling_elevation_m: number }[])[0].ceiling_elevation_m = 1.9
  expect(auditHearthCarry(f.room, f.building)).toContain("F: Carry lacks standing headroom")
})

it("rejects a route outside the room and an unknown ceiling", () => {
  const f = fixture("h-m5"),
    point = f.op.carry!.poses[1].body_m
  f.op.carry!.poses[1].body_m = [-1, 5.5]
  expect(auditHearthCarry(f.room, f.building)).toContain("H: Carry leaves its room")
  f.op.carry!.poses[1].body_m = point
  delete (f.building.floor_levels as { ceiling_elevation_m?: number }[])[0].ceiling_elevation_m
  expect(auditHearthCarry(f.room, f.building)).toContain("H: Carried tool lacks ceiling clearance")
})

it("returns an audit error for an invalid door without aborting the whole settings check", () => {
  const f = fixture("h-m5"),
    leaves = f.room.door_leaves as { door: number[] }[]
  leaves[0].door = [3, 3]
  expect(auditHearthCarry(f.room, f.building)).toContain("H: Room has an invalid door leaf")
})
