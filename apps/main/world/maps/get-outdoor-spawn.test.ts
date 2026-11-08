import { expect, it } from "vitest"
import { getOutdoorSpawn } from "#/world/maps/get-outdoor-spawn"
import type { MapDefinition, Cell } from "#/world/maps/types"

const map = (id: string): MapDefinition => ({
  id,
  name: id,
  kind: "field",
  size: 24,
  rows: Array.from({ length: 24 }, () => ".".repeat(24)),
  spawn: [8, 8],
  places: {},
  npcs: [],
  assets: { sprites: "" },
  warps: [],
})
const link = (destination: string, at: Cell) => ({ at: [8, 8] satisfies Cell, to: { map: destination, at } })
it("chooses the return arrival from the neighbor nearest town", () => {
  const field = { ...map("field"), warps: [link("far", [8, 8]), link("near", [9, 9])] },
    maps = { field, far: { ...map("far"), warps: [link("field", [12, 13])] }, near: { ...map("near"), warps: [link("field", [10, 11])] } },
    before = structuredClone(maps)
  expect(
    getOutdoorSpawn(
      field,
      maps,
      new Map([
        ["far", 3],
        ["near", 1],
      ]),
    ),
  ).toEqual([10, 11])
  expect(
    getOutdoorSpawn(
      field,
      maps,
      new Map([
        ["far", 1],
        ["near", 1],
      ]),
    ),
  ).toEqual([12, 13])
  expect(maps).toEqual(before)
})
it("rejects a missing return route rather than inventing an arrival", () => {
  const field = { ...map("field"), warps: [link("neighbor", [8, 8])] }
  expect(() => getOutdoorSpawn(field, { field, neighbor: map("neighbor") }, new Map())).toThrow("Outdoor crossing has no return: field / neighbor")
})
it("keeps town spawns and fields without an exit under their own definitions", () => {
  const field = map("field")
  expect(getOutdoorSpawn(field, { field }, new Map())).toBeUndefined()
  expect(getOutdoorSpawn({ ...field, kind: "town" }, { field }, new Map())).toBeUndefined()
})
