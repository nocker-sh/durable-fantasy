import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { z } from "zod"
import { readSetting } from "#/scripts/lib/read-setting"
import { buildingDoorInventorySchema, roomDoorPortalSchema } from "#/scripts/lib/building-door-inventory-schema"
import { auditBuildingDoorInventory } from "#/scripts/lib/audit-building-door-inventory"
import { getBuildingDoorPortals } from "#/scripts/lib/get-building-door-portals"
import { getRoomDoorPortals } from "#/scripts/lib/get-room-door-portals"
import { auditDoorSwings } from "#/scripts/lib/audit-door-swings"

function fixture() {
  const building = readSetting(readFileSync(".docs/settings/buildings/building-hue-ludwig.md", "utf8")),
    roomIds = z.array(z.string()).parse(building.rooms)
  const rooms = roomIds.map((id) => readSetting(readFileSync(`.docs/settings/rooms/${id}.md`, "utf8"))),
    documents = new Map([building, ...rooms].map((document) => [document.id, document]))
  const bedroom = documents.get("room-hue-ludwig-2"),
    fuel = documents.get("room-hue-ludwig-fuel")
  if (!bedroom || !fuel) throw new Error("Missing authored rooms")
  const inventory = buildingDoorInventorySchema.parse(building.door_leaf_inventory)
  building.door_leaf_inventory = inventory
  return { building, rooms, documents, bedroom, fuel, inventory }
}

it("owns seven physical doorways once despite their shared room connections", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents]),
    portals = getBuildingDoorPortals(source)
  if (portals instanceof Error) throw portals
  expect(new Set(portals.map((portal) => portal.key)).size).toBe(7)
  expect(portals.reduce((count, portal) => count + portal.leafCount, 0)).toBe(7)
  expect(auditBuildingDoorInventory(source.building, source.documents)).toEqual([])
  for (const room of source.rooms) expect(auditDoorSwings(room)).toEqual([])
  expect(JSON.stringify([...source.documents])).toBe(before)
})

it("rejects a missing inventory entry and duplicate claims from the same declared owner", () => {
  const source = fixture()
  source.building.door_leaf_inventory = source.inventory.slice(1)
  expect(auditBuildingDoorInventory(source.building, source.documents)).toContain("Door portal 0:h:3,6:2: missing or duplicate physical ownership")
  source.building.door_leaf_inventory = [...source.inventory, source.inventory[0]]
  expect(auditBuildingDoorInventory(source.building, source.documents)).toContain("Door inventory room-hue-ludwig-2/3,6: no unique matching owner")
})

it("does not replace a real leaf with a declaration in the inventory", () => {
  const source = fixture()
  source.bedroom.door_leaves = []
  expect(auditBuildingDoorInventory(source.building, source.documents)).toContain("Door inventory room-hue-ludwig-2/3,6: no unique matching owner")
  expect(auditBuildingDoorInventory(source.building, source.documents)).toContain("Door portal 0:h:3,6:2: missing or duplicate physical ownership")
})

it("resolves the building's own rooms rather than borrowing a neighbour's geometry", () => {
  const source = fixture()
  source.bedroom.building = "building-other"
  expect(getBuildingDoorPortals(source)).toEqual(new Error("Door inventory room does not belong to its building"))
  expect(auditBuildingDoorInventory(source.building, source.documents)).toContain("Door inventory room does not belong to its building")
})

it("keeps floor identity and rejects a leaf on a connection declared as an opening", () => {
  const source = fixture(),
    bedroom = roomDoorPortalSchema.parse(source.bedroom),
    original = getRoomDoorPortals(source.bedroom)
  if (original instanceof Error) throw original
  source.bedroom.floor = 1
  const upstairs = getRoomDoorPortals(source.bedroom)
  if (upstairs instanceof Error) throw upstairs
  expect(upstairs[0].key).not.toBe(original[0].key)
  bedroom.connections[0].kind = "opening"
  source.bedroom.connections = bedroom.connections
  expect(getRoomDoorPortals(source.bedroom)).toEqual(new Error("Door leaf has no matching room portal"))
})

it("does not use work sequencing to excuse a real bed or cupboard collision", () => {
  const source = fixture(),
    room = roomDoorPortalSchema.parse(source.bedroom)
  source.bedroom.door_leaves = room.door_leaves?.map((leaf) => ({ ...leaf, hinge: "start" }))
  expect(auditDoorSwings(source.bedroom)).toContain("Door 3,6: swing hits B")
  expect(auditDoorSwings(source.bedroom)).toContain("Door 3,6: swing hits C")
})

it("requires the real overlapping work to stop before moving the leaf", () => {
  const source = fixture(),
    room = roomDoorPortalSchema.parse(source.fuel)
  source.fuel.door_leaves = room.door_leaves?.map((leaf) => ({ ...leaf, waits_for: [] }))
  expect(auditDoorSwings(source.fuel)).toContain("Door 3,0: unsequenced operating space B/0")
  expect(auditDoorSwings(source.fuel)).toContain("Door 7,3: unsequenced operating space T/0")
})

it("retains an unfinished legacy plan without treating a missing inventory as a completed design", () => {
  const source = fixture()
  delete source.building.door_leaf_inventory
  expect(auditBuildingDoorInventory(source.building, source.documents)).toEqual([])
  source.building.design_gate = "通過"
  expect(auditBuildingDoorInventory(source.building, source.documents)).toContain("Invalid building door inventory")
})

it("rejects a doorway whose start or full aperture falls outside the room", () => {
  const source = fixture(),
    room = roomDoorPortalSchema.parse(source.bedroom)
  room.connections[0].door = [0, 999]
  source.bedroom.connections = room.connections
  expect(getRoomDoorPortals(source.bedroom)).toEqual(new Error("Door inventory has no bounded boundary portal"))
  room.connections[0].door = [6, 6]
  room.connections[0].width_cells = 2
  source.bedroom.connections = room.connections
  expect(getRoomDoorPortals(source.bedroom)).toEqual(new Error("Door inventory has no bounded boundary portal"))
})
