import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditDoorSwings } from "#/scripts/lib/audit-door-swings"
import { auditOperatorSpaces } from "#/scripts/lib/audit-operator-spaces"
import { auditDoorOperation } from "#/scripts/lib/audit-door-operation"
import { operatorRectDistance } from "#/scripts/lib/operator-rect-distance"
import type { DoorOperation } from "#/scripts/lib/door-operation"
import type { DoorSwing } from "#/scripts/lib/door-swing"
const swing: DoorSwing = { hinge: [0, 0], radius: 1, open_tip: [0, 1], bounds: [0, 0, 1, 1] }
const operation = (): DoorOperation => ({ body_radius_m: 0.4, orbit_radius_m: 1.5, start_deg: 20, end_deg: 70 })
it("keeps the full body outside the moving leaf while maintaining reach", () => {
  expect(auditDoorOperation({ swing: swing, operation: operation(), rows: [], scale: 0.5 })).toEqual([])
})
it("detects an obstacle between the start and end of the operator's movement", () => {
  const op = { ...operation(), orbit_radius_m: 2, start_deg: 0, end_deg: 90 }
  expect(operatorRectDistance(swing, op, [1.4, 1.4, 0.05, 0.05])).toBeCloseTo(0)
  expect(operatorRectDistance(swing, op, [2.2, 2.2, 0.1, 0.1])).toBeGreaterThan(1)
})
it("uses the hinge and inward direction for reflected doorways", () => {
  const reflected: DoorSwing = { hinge: [4, 4], radius: 1, open_tip: [3, 4], bounds: [3, 3, 4, 4] }
  expect(operatorRectDistance(reflected, operation(), [1.8, 1.8, 0.2, 0.2])).toBeCloseTo(operatorRectDistance(swing, operation(), [2, 2, 0.2, 0.2]))
})
it("does not shrink the person's body to make a confined operation pass", () => {
  expect(auditDoorOperation({ swing: swing, operation: { ...operation(), body_radius_m: 0.1 }, rows: [], scale: 0.5 })).toContain("operator body is smaller than the design width")
})
it("checks the body against the entire swept leaf", () => {
  expect(auditDoorOperation({ swing: swing, operation: { ...operation(), orbit_radius_m: 1.1 }, rows: [], scale: 0.5 })).toContain("operator body enters the leaf's swept area")
})
it("checks handle reach throughout the ninety-degree movement", () => {
  expect(auditDoorOperation({ swing: swing, operation: { ...operation(), orbit_radius_m: 2 }, rows: [], scale: 0.5 })).toContain("handle is out of reach during operation")
})
it("checks the person's path against occupied floor cells", () => {
  expect(auditDoorOperation({ swing: swing, operation: operation(), rows: ["....", "....", "..A.", "...."], scale: 0.5 })).toContain("operator path hits A")
})
it("rejects a backward operator arc", () => {
  expect(auditDoorOperation({ swing: swing, operation: { ...operation(), start_deg: 70, end_deg: 20 }, rows: [], scale: 0.5 })).toEqual(["operator arc runs backward"])
})

it("keeps the authored entrance clear of the stair rather than restoring the old cramped position", () => {
  const doc = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h4-1.md", import.meta.url), "utf8"))
  expect(auditDoorSwings(doc)).toEqual([])
  const leaves = doc.door_leaves as { door: number[] }[],
    connections = doc.connections as { door?: number[] }[]
  leaves[0].door = [4, 13]
  connections.find((c) => c.door)?.door!.splice(0, 2, 4, 13)
  doc.grid!.rows[13] = "####DD####"
  expect(auditDoorSwings(doc)).toContain("Door 4,13: operator path hits S")
})

it("rejects an operator outside the room even when there is no occupied cell to collide with", () => {
  expect(auditDoorOperation({ swing: swing, operation: operation(), rows: ["..", ".."], scale: 0.5 })).toContain("operator body leaves the room footprint")
  expect(auditDoorOperation({ swing: swing, operation: operation(), rows: Array(5).fill("....."), scale: 0.5 })).not.toContain("operator body leaves the room footprint")
})
it("checks the entire body rather than only its centre at a reflected doorway", () => {
  const reflected: DoorSwing = { hinge: [1.7, 1.7], radius: 1, open_tip: [0.7, 1.7], bounds: [0.7, 0.7, 1.7, 1.7] }
  expect(auditDoorOperation({ swing: reflected, operation: operation(), rows: Array(5).fill("....."), scale: 0.5 })).toContain("operator body leaves the room footprint")
})

it("keeps the chapel's internal door operators clear of the visitor benches", () => {
  const doc = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-chapel-hall.md", import.meta.url), "utf8"))
  expect(auditDoorSwings(doc)).toEqual([])
  // Returning a bench to the former west aisle obstructs the operator's body.
  doc.grid!.rows[20] = doc.grid!.rows[20].slice(0, 10) + "AAAA" + doc.grid!.rows[20].slice(14)
  expect(auditDoorSwings(doc)).toContain("Door 0,22: operator path hits A")
})

it("requires a reasoned sequence when the operator's body crosses another furniture user's space", () => {
  const furniture = [{ symbol: "A", use_space: [{ rect: [1.3, 1.3, 0.2, 0.2] }] }]
  const op = { ...operation(), orbit_radius_m: 2 }
  expect(auditOperatorSpaces({ swing: swing, operation: op, furniture: furniture, scale: 1 })).toEqual(["operator path conflicts with operating space A/0"])
  const sequenced = { ...op, waits_for: [{ furniture: "A", space_index: 0, reason: "使用面を空けてから開ける" }] }
  expect(auditOperatorSpaces({ swing: swing, operation: sequenced, furniture: furniture, scale: 1 })).toEqual([])
  expect(auditOperatorSpaces({ swing: swing, operation: { ...sequenced, waits_for: [...sequenced.waits_for, ...sequenced.waits_for] }, furniture: furniture, scale: 1 })).toContain(
    "operator has a duplicate waiting condition",
  )
  expect(auditOperatorSpaces({ swing: swing, operation: sequenced, furniture: [{ symbol: "A", use_space: [{ rect: [5, 5, 1, 1] }] }], scale: 1 })).toContain(
    "operator waiting condition has no conflicting space A/0",
  )
})

it("tests reach to the actual grip even when the leaf tip would be reachable", () => {
  const op = { ...operation(), orbit_radius_m: 1.7, start_deg: 0, end_deg: 90 }
  expect(auditDoorOperation({ swing: swing, operation: op, rows: [], scale: 0.5 })).toEqual([])
  expect(auditDoorOperation({ swing: { ...swing, handle_along_m: 0.5 }, operation: op, rows: [], scale: 0.5 })).toContain("handle is out of reach during operation")
})
