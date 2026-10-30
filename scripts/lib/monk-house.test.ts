import { auditDoorPushes } from "#/scripts/lib/audit-door-pushes"
import type { DoorPush } from "#/scripts/lib/door-push"
import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditBuildingFoundation } from "#/scripts/lib/audit-building-foundation"
import { auditEntrySteps } from "#/scripts/lib/audit-entry-steps"
import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import { auditDoorSwings } from "#/scripts/lib/audit-door-swings"
import { roomDoorSwing } from "#/scripts/lib/room-door-swing"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import { auditSiteBounds } from "#/scripts/lib/audit-site-bounds"
import { VILLAGE } from "#/world/maps/layout"
import { currentLayout } from "#/world/scene/current-layout"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { F, FR, GRID_N } from "#/world/scene/world"
import { ScalarField } from "../../lib/engine/scalar-field"
import { TILE_M } from "#/world/town/fit"

const read = (directory: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${directory}/${id}.md`, import.meta.url), "utf8"))
it("fits the monk home's foundation, west-facing entrance and landings to the actual ground and neighbouring plan", () => {
  const building = read("buildings", "building-h10"),
    room = read("rooms", "room-h10-1"),
    neighbour = read("buildings", "building-h9")
  const documents = new Map([[room.id, room]])
  const previous = currentLayout()
  try {
    setLayout(VILLAGE)
    groundH(0, 0)
    const terrain = new ScalarField(F.h.slice(), GRID_N, FR)
    expect(auditBuildingFoundation(building, terrain, TILE_M)).toEqual([])
    expect(auditEntrySteps({ building: building, documents: documents, terrain: terrain, metres: TILE_M })).toEqual([])
    expect(auditDoorSwings(room)).toEqual([])
    const entries = building.entry_steps as Parameters<typeof entryStepGeometry>[0]["steps"][]
    expect(entries).toHaveLength(1)
    const entrance = entryStepGeometry({ building: building, documents: documents, steps: entries[0], metres: TILE_M })!
    expect(entrance.outward).toEqual([-1, 0])
    const bounds = auditBuildingSite({ building: neighbour, houses: [], metresPerTile: TILE_M, roads: [] }).bounds!
    const house = { id: "h9", map: "phanthiet", x0: bounds[0], z0: bounds[1], x1: bounds[2], z1: bounds[3] }
    expect(auditSiteBounds({ bounds: entrance.bounds, building: building, houses: [house], roads: [], mapTiles: 48, label: "Entry stair footprint" })).toEqual([])
    const blockedRoom = structuredClone(room)
    ;(blockedRoom.door_leaves as { vertical_clearance_m: { bottom: number; top: number } }[])[0].vertical_clearance_m = { bottom: 1, top: 1 }
    expect(auditEntrySteps({ building: building, documents: new Map([[room.id, blockedRoom]]), terrain: terrain, metres: TILE_M })).toContain("Door leaf needs positive clearances within its opening")
    const lowered = structuredClone(building)
    ;(lowered.foundation as { floor_elevation_m: number }).floor_elevation_m = 0.5
    expect(auditBuildingFoundation(lowered, terrain, TILE_M)).toContain("Raised floor intersects terrain or lacks its designed ground gap")
  } finally {
    setLayout(previous)
  }
})

it("lets the monk home doorway be operated without moving the praying person out of the way", () => {
  const room = read("rooms", "room-h10-1")
  const leaves = room.door_leaves as { operation?: { waits_for?: unknown[] } }[]
  expect(leaves[0].operation).toBeDefined()
  expect(leaves[0].operation?.waits_for).toEqual([])
  expect(auditDoorSwings(room)).toEqual([])
  // Restoring the former platform and its use space blocks the operator, even though the leaf clears it.
  const prior = structuredClone(room),
    platform = prior.furniture!.find((piece) => piece.symbol === "P")!
  const rows = prior.grid!.rows.map((row) => row.replaceAll("P", "."))
  platform.rect = [5, 1, 2, 2]
  platform.access = [[5, 3]]
  platform.use_space![0].rect = [5, 3, 2, 2]
  for (let y = 1; y < 3; y++) rows[y] = rows[y].slice(0, 5) + "PP" + rows[y].slice(7)
  prior.grid!.rows = rows
  expect(auditDoorSwings(prior)).toEqual(expect.arrayContaining(["Door 4,0: operator path hits P", "Door 4,0: operator path conflicts with operating space P/0"]))
})

it("supports the continuous entry and transfer to indoor closing on the monk home's landing", () => {
  const room = read("rooms", "room-h10-1"),
    building = read("buildings", "building-h10")
  const documents = new Map([
    [room.id, room],
    [building.id, building],
  ])
  const leaf = (room.door_leaves as { push_operation: DoorPush }[])[0]
  expect(leaf.push_operation).toBeDefined()
  expect(leaf.push_operation.body_radius_m).toBe(0.4)
  expect(auditDoorPushes(documents)).toEqual([])
  expect(roomDoorSwing(room, (room.door_leaves as Parameters<typeof roomDoorSwing>[1][])[0])!.thickness_m).toBeCloseTo(0.08)
  const at60 = leaf.push_operation.poses.find((pose) => pose.angle_deg === 60)!
  const correct = at60.body_m[0]
  at60.body_m[0] = 0.52
  expect(auditDoorPushes(documents)).toContain(`${room.id}: push body intersects the moving panel`)
  at60.body_m[0] = correct
  const original = structuredClone(leaf.push_operation.poses)
  // Leaving the centre line before the body has moved in clips the narrow landing's corner.
  leaf.push_operation.poses = original.filter((pose) => pose.angle_deg !== 20)
  expect(auditDoorPushes(documents)).toContain(`${room.id}: push body crosses a wall, furniture or unsupported floor`)
  leaf.push_operation.poses = original
  ;(building.entry_steps as { clear_width_m: number }[])[0].clear_width_m = 0.7
  expect(auditDoorPushes(documents)).toContain(`${room.id}: push body crosses a wall, furniture or unsupported floor`)
})
