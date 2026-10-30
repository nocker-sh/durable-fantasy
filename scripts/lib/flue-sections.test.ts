import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { readSetting } from "#/scripts/lib/read-setting"
import { compileFlues } from "./flue-sections"
const read = (kind: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${id}.md`, import.meta.url), "utf8"))
const building = read("buildings", "building-h-m5")
const rooms = new Map((building.rooms as string[]).map((id) => [id, read("rooms", id)]))
it("reserves a supported shaft with records kept clear", () => {
  expect(compileFlues(building, rooms)).toEqual([{ x0: 7.5, z0: 0.5, x1: 8, z1: 1, wallThickness: 0.1, floorCollar: 0.15, floorSupport: { depth: 0.2, steps: 4 }, lowerFloor: 0, upperFloor: 1 }])
})
it("rejects the former record-shelf position through the chimney", () => {
  const altered = structuredClone(rooms)
  altered.get("room-h-m5-2")!.furniture!.find((f) => f.symbol === "B")!.rect = [8, 1, 4, 1]
  expect(() => compileFlues(building, altered)).toThrow("Flue intersects storage")
})
it("rejects a shaft moved away from its hearth", () => {
  const altered = structuredClone(rooms)
  altered.get("room-h-m5-2")!.furniture!.find((f) => f.symbol === "H")!.rect = [1, 1, 1, 1]
  expect(() => compileFlues(building, altered)).toThrow("not supported by its hearth")
})

it("keeps the monk home's cooking flue supported and clear of both beds and lower furniture", () => {
  const building = read("buildings", "building-h10"),
    rooms = new Map((building.rooms as string[]).map((id) => [id, read("rooms", id)]))
  expect(compileFlues(building, rooms)).toEqual([{ x0: 5.5, z0: 8, x1: 6, z1: 8.5, wallThickness: 0.1, floorCollar: 0.15, floorSupport: { depth: 0.2, steps: 4 }, lowerFloor: 0, upperFloor: 1 }])
  const blockedBed = structuredClone(rooms)
  blockedBed.get("room-h10-2")!.furniture!.find((f) => f.symbol === "B")!.rect = [10, 13, 2, 4]
  expect(() => compileFlues(building, blockedBed)).toThrow("Flue intersects furniture")
  const blockedChair = structuredClone(rooms)
  blockedChair.get("room-h10-1")!.furniture!.find((f) => f.symbol === "E")!.rect = [9, 15, 1, 1]
  expect(() => compileFlues(building, blockedChair)).toThrow("Flue intersects furniture")
})

it("also rejects hot-clearance violations in another room on the same floor", () => {
  const altered = structuredClone(rooms),
    neighbor = altered.get("room-h-m5-upper-stairs")!
  neighbor.origin = [12, 0]
  expect(() => compileFlues(building, altered)).toThrow("Flue intersects furniture")
})

it("requires a dimensioned floor collar before compiling a shaft", () => {
  const altered = structuredClone(building)
  delete (altered.flues as { floor_collar_m?: number }[])[0].floor_collar_m
  expect(() => compileFlues(altered, rooms)).toThrow("floor collar is missing")
})

it("rejects a missing support and a corbel which takes away standing headroom", () => {
  const altered = structuredClone(building)
  const definition = (altered.flues as { floor_support?: { depth_m: number; steps: number } }[])[0]
  const support = definition.floor_support!
  delete definition.floor_support
  expect(() => compileFlues(altered, rooms)).toThrow("floor support is missing")
  definition.floor_support = { ...support, depth_m: 1 }
  expect(() => compileFlues(altered, rooms)).toThrow("standing headroom")
})

it("rejects masonry which closes its duct", () => {
  const altered = structuredClone(building)
  ;(altered.flues as { wall_thickness_m: number }[])[0].wall_thickness_m = 0.25
  expect(() => compileFlues(altered, rooms)).toThrow("leaves no duct")
})

it("rejects a hearth body which reaches through its ceiling", () => {
  const altered = structuredClone(rooms)
  const spec = altered.get("room-h-m5-1")!.furniture!.find((f) => f.runtime_kind === "hearth")!.hearth as { height_m: number }
  spec.height_m = 3
  expect(() => compileFlues(building, altered)).toThrow("no vertical flue below the ceiling")
})
