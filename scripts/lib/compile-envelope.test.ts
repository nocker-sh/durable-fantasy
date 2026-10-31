import { compileFlues } from "#/scripts/lib/flue-sections"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { compileEnvelope } from "#/scripts/lib/compile-envelope"
import plan from "#/world/town/floorplan/authored/h-m5"
import { TILE_M } from "#/world/town/fit"

const read = (directory: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${directory}/${id}.md`, import.meta.url), "utf8"))
const source = () => {
  const building = read("buildings", "building-h-m5")
  const rooms = new Map((building.rooms as string[]).map((id) => [id, read("rooms", id)]))
  return { building, rooms }
}
it("keeps the audited leaf depth and hinge side under every site rotation", () => {
  for (let rotation = 0; rotation < 4; rotation++)
    for (const hinge of ["start", "end"] as const) {
      const { building, rooms } = source()
      ;(building.site_plan as { rotation_quarters: number }).rotation_quarters = rotation
      const entry = (building.entry_steps as { room: string }[])[0],
        room = rooms.get(entry.room)!
      const leaf = (room.door_leaves as { hinge: "start" | "end" }[])[0]
      leaf.hinge = hinge
      const envelope = compileEnvelope(building, rooms, plan)
      expect(envelope.door.recess * TILE_M).toBeCloseTo(plan.cellM)
      expect(Math.abs(envelope.door.hingeSign)).toBe(1)
      leaf.hinge = hinge === "start" ? "end" : "start"
      expect(compileEnvelope(building, rooms, plan).door.hingeSign).toBe(-envelope.door.hingeSign)
    }
})
it("rejects an unsupported paired entrance instead of drawing a single panel", () => {
  const { building, rooms } = source(),
    entry = (building.entry_steps as { room: string }[])[0]
  ;(rooms.get(entry.room)!.door_leaves as { paired?: boolean }[])[0].paired = true
  expect(() => compileEnvelope(building, rooms, plan)).toThrow("Paired exterior door rendering is not supported")
})

it("requires authored vertical clearances and rejects a leaf with no remaining height", () => {
  const { building, rooms } = source(),
    entry = (building.entry_steps as { room: string }[])[0]
  const leaf = (rooms.get(entry.room)!.door_leaves as { vertical_clearance_m?: { bottom: number; top: number } }[])[0]
  delete leaf.vertical_clearance_m
  expect(() => compileEnvelope(building, rooms, plan)).toThrow("vertical clearances are missing")
  leaf.vertical_clearance_m = { bottom: 1, top: 1 }
  expect(() => compileEnvelope(building, rooms, plan)).toThrow("positive clearances")
})
it("fits the monk home's north doorway to its west-facing site and finished floor", () => {
  const building = read("buildings", "building-h10"),
    room = read("rooms", "room-h10-1")
  const layout = building.layout as { cell_m: number; width: number; depth: number }
  const rooms = new Map([
    [room.id, room],
    ["room-h10-2", read("rooms", "room-h10-2")],
  ])
  const envelope = compileEnvelope(building, rooms, {
    ...plan,
    cellM: layout.cell_m,
    width: layout.width,
    depth: layout.depth,
    flues: compileFlues(building, rooms),
    windows: [],
    entryHeight: Number(building.entry_opening_height_m),
  })
  expect(envelope.door.outward).toEqual([-1, 0])
  expect(envelope.door.recess * TILE_M).toBeCloseTo(layout.cell_m)
  expect(envelope.door.leafBottom * TILE_M).toBeCloseTo(0.01)
  expect((envelope.door.height - envelope.door.leafTop) * TILE_M).toBeCloseTo(0.005)
  expect(envelope.door.point[0] - envelope.door.outward[0] * envelope.door.recess).toBeCloseTo(23 + layout.cell_m / TILE_M)
})
