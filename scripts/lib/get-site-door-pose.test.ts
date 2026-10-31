import { expect, it } from "vitest"
import { getSiteDoorPose } from "#/scripts/lib/get-site-door-pose"
import { getRoomSiteRectangle } from "#/scripts/lib/get-room-site-rectangle"
import type { SettingDocument } from "#/scripts/lib/setting-document"

function fixture(): Parameters<typeof getSiteDoorPose>[0] {
  return {
    grid: { rows: ["#DD##", "#...#", "#...#", "#####"], cell_m: 0.5 },
    room_origin: [2, 3],
    door: [1, 0],
    span: 2,
    site_origin: [-10, 20],
    width_m: 8,
    depth_m: 6,
    rotation_quarters: 0,
    metres_per_tile: 2,
  }
}

it.each([0, 1, 2, 3])("places every doorway on its projected room boundary at rotation %s", (rotation) => {
  const sides = [
    { rows: ["#DD##", "#...#", "#...#", "#####"], door: [1, 0] },
    { rows: ["#####", "#...#", "#...#", "#DD##"], door: [1, 3] },
    { rows: ["#####", "D...#", "D...#", "#####"], door: [0, 1] },
    { rows: ["#####", "#...D", "#...D", "#####"], door: [4, 1] },
  ]
  for (const side of sides) {
    const input = { ...fixture(), grid: { rows: side.rows, cell_m: 0.5 }, door: side.door, rotation_quarters: rotation }
    const base = { title: "test", status: "設計中", source: "test", design_gate: "未通過", issues: [] }
    const room: SettingDocument = { ...base, id: "room", kind: "rooms", building: "building", floor: 0, origin: input.room_origin, grid: input.grid }
    const building: SettingDocument = {
      ...base,
      id: "building",
      kind: "buildings",
      rooms: [room.id],
      layout: { width: 16, depth: 12, cell_m: 0.5 },
      site_plan: { origin: input.site_origin, rotation_quarters: rotation },
    }
    const rectangle = getRoomSiteRectangle({ building, room, rect: [0, 0, 2.5, 2], metresPerTile: 2 })
    const pose = getSiteDoorPose(input)
    if (!pose || rectangle instanceof Error) throw new Error("Valid room and boundary doorway must project")
    expect(pose.point[0]).toBeGreaterThanOrEqual(rectangle[0])
    expect(pose.point[0]).toBeLessThanOrEqual(rectangle[2])
    expect(pose.point[1]).toBeGreaterThanOrEqual(rectangle[1])
    expect(pose.point[1]).toBeLessThanOrEqual(rectangle[3])
    if (pose.outward[0] < 0) expect(pose.point[0]).toBe(rectangle[0])
    if (pose.outward[0] > 0) expect(pose.point[0]).toBe(rectangle[2])
    if (pose.outward[1] < 0) expect(pose.point[1]).toBe(rectangle[1])
    if (pose.outward[1] > 0) expect(pose.point[1]).toBe(rectangle[3])
    expect(pose.width_m).toBe(1)
    expect(pose.bounds).toEqual(rotation % 2 ? [-10, 20, -7, 24] : [-10, 20, -6, 23])
  }
})

it("rejects overflowing transforms and incomplete or nonfinite origins without throwing", () => {
  for (const invalid of [
    { metres_per_tile: Number.MIN_VALUE },
    { room_origin: [Infinity, 0] },
    { room_origin: [Number.MAX_VALUE, 0], site_origin: [Number.MAX_VALUE, 0], grid: { ...fixture().grid, cell_m: 1 }, metres_per_tile: 1 },
    { site_origin: [0] },
    { site_origin: [0, NaN] },
    { grid: { ...fixture().grid, cell_m: 1e308 }, width_m: 1e308, depth_m: 1e308, metres_per_tile: 1e308 },
  ]) {
    expect(getSiteDoorPose({ ...fixture(), ...invalid })).toBeUndefined()
  }
})

it("rejects gaps, negative indices and excessive spans without materializing the declared span", () => {
  for (const invalid of [{ span: Number.MAX_SAFE_INTEGER }, { span: 3 }, { door: [-1, 0] }, { door: [1, -1] }]) {
    expect(getSiteDoorPose({ ...fixture(), ...invalid })).toBeUndefined()
  }
  expect(getSiteDoorPose({ ...fixture(), grid: { rows: ["#D.D#", "#####"], cell_m: 0.5 }, span: 3 })).toBeUndefined()
})
