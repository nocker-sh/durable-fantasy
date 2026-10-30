import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { closingTransfer } from "#/scripts/lib/closing-transfer"
import { auditDoorPushes } from "#/scripts/lib/audit-door-pushes"
import { auditDoorPushMotion } from "#/scripts/lib/audit-door-push-motion"
import { auditDoorPushFloor } from "#/scripts/lib/audit-door-push-floor"
import type { DoorPush } from "#/scripts/lib/door-push"
import { readSetting } from "#/scripts/lib/read-setting"
import { roomDoorSwing } from "#/scripts/lib/room-door-swing"
import type { DoorSwing } from "#/scripts/lib/door-swing"
const swing: DoorSwing = { hinge: [0, 0], radius: 0.95, open_tip: [0, 0.95], bounds: [0, 0, 0.95, 0.95], thickness_m: 0.04 }
const push = (): DoorPush => ({
  body_radius_m: 0.4,
  poses: [
    [0, -0.5],
    [45, -0.1],
    [60, 0.04],
    [70, 0.15],
    [80, 0.32],
    [90, 0.5],
  ].map(([angle_deg, v]) => ({ angle_deg, body_m: [0.52, v] })),
})
function hall() {
  const load = (kind: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${id}.md`, import.meta.url), "utf8"))
  const room = load("rooms", "room-h-m5-1"),
    building = load("buildings", "building-h-m5")
  return {
    room,
    building,
    documents: new Map([
      [room.id, room],
      [building.id, building],
    ]),
  }
}
it("certifies the continuous push while the full body enters and the handle stays reachable", () => {
  expect(auditDoorPushMotion(swing, push())).toEqual([])
})
it("rejects a collision between two valid endpoint poses instead of accepting sampled endpoints", () => {
  const operation = push()
  operation.poses = [operation.poses[0], operation.poses.at(-1)!]
  expect(auditDoorPushMotion(swing, operation)).toContain("push body intersects the moving panel")
})
it("does not make the entrant smaller or release an unreachable handle to pass", () => {
  expect(auditDoorPushMotion(swing, { ...push(), body_radius_m: 0.1 })).toContain("push body is smaller than the design width")
  const operation = push()
  operation.poses[2].body_m = [0.52, -1]
  expect(auditDoorPushMotion(swing, operation)).toContain("push handle is out of reach")
})
it("rejects discontinuous angle order and an operation that never enters", () => {
  const operation = push()
  operation.poses[2].angle_deg = 30
  expect(auditDoorPushMotion(swing, operation)).toEqual(["push poses do not continuously open a closed door"])
  const outside = push()
  outside.poses.at(-1)!.body_m[1] = -0.5
  expect(auditDoorPushMotion(swing, outside)).toContain("push does not move the body from outside to inside")
})
it("connects the authored exterior landing and framed doorway to the indoor floor without rewriting", () => {
  const f = hall(),
    before = JSON.stringify([...f.documents])
  expect(auditDoorPushes(f.documents)).toEqual([])
  expect(JSON.stringify([...f.documents])).toBe(before)
})
it("rejects a missing landing and a narrowed landing even when the panel motion is valid", () => {
  const f = hall(),
    steps = f.building.entry_steps as { clear_width_m: number }[]
  steps[0].clear_width_m = 0.6
  expect(auditDoorPushes(f.documents)).toContain(`${f.room.id}: push body crosses a wall, furniture or unsupported floor`)
  f.building.entry_steps = []
  expect(auditDoorPushes(f.documents)).toContain(`${f.room.id}: push has no single exterior panel and designed landing`)
})
it("keeps both the body and other furniture users clear throughout the linear crossing", () => {
  const f = hall(),
    leaf = (f.room.door_leaves as Parameters<typeof roomDoorSwing>[1][])[0],
    panel = roomDoorSwing(f.room, leaf)!
  const landing = [2.55, 10, 3.45, 11] as const
  f.room.grid!.rows[18] = f.room.grid!.rows[18].slice(0, 5) + "X" + f.room.grid!.rows[18].slice(6)
  expect(auditDoorPushFloor({ room: f.room, swing: panel, push: push(), landing: landing })).toContain("push body crosses a wall, furniture or unsupported floor")
  f.room.furniture!.push({ symbol: "Z", name: "作業面", owner: "町", source: "test", rect: [0, 0, 1, 1], access: [], use_space: [{ activity: "立つ", rect: [5, 18, 2, 1] }] })
  expect(auditDoorPushFloor({ room: f.room, swing: panel, push: push(), landing: landing })).toContain("push body conflicts with operating space Z/0")
})

it("keeps the same person holding the open door while moving to the indoor closing position", () => {
  const operation = { body_radius_m: 0.4, orbit_radius_m: 1.4, start_deg: 20, end_deg: 70 }
  expect(closingTransfer(swing, push(), operation).errors).toEqual([])
  expect(closingTransfer(swing, push(), { ...operation, body_radius_m: 0.2 }).errors).toContain("push changes body size before indoor closing")
  expect(closingTransfer(swing, push(), { ...operation, orbit_radius_m: 3 }).errors).toContain("closing transfer releases an unreachable handle")
})

it("holds the actual grip while transferring to the indoor closing position", () => {
  const op = { body_radius_m: 0.4, orbit_radius_m: 1.4, start_deg: 20, end_deg: 70 }
  expect(closingTransfer(swing, push(), op).errors).toEqual([])
  expect(closingTransfer({ ...swing, handle_along_m: 0.2 }, push(), op).errors).toContain("closing transfer releases an unreachable handle")
  const chord = push()
  chord.poses = [chord.poses[0], chord.poses.at(-1)!]
  expect(auditDoorPushMotion({ ...swing, handle_along_m: 0.2 }, chord)).toContain("push body intersects the moving panel")
})
