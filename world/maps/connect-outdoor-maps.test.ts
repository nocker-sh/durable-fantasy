import { expect, it } from "vitest"
import { connectOutdoorMaps } from "#/world/maps/connect-outdoor-maps"
import { MAPS } from "#/world/maps"
import type { MapDefinition } from "#/world/maps/types"

const map = (id: string, kind: MapDefinition["kind"]): MapDefinition => ({
  id,
  name: id,
  kind,
  size: 24,
  rows: Array.from({ length: 24 }, () => ".".repeat(24)),
  spawn: [8, 8],
  places: {},
  npcs: [],
  assets: { sprites: "" },
  warps: [],
})
it("rebuilds actual outdoor crossings and arrivals without mutating the source maps", () => {
  const source = Object.fromEntries(Object.entries(MAPS).filter((entry) => entry[1].kind !== "indoor")),
    before = structuredClone(source)
  const connected = connectOutdoorMaps(source)
  for (const entry of Object.entries(source)) expect(connected[entry[0]]).toEqual({ ...entry[1], warps: entry[1].warps.filter((warp) => MAPS[warp.to.map].kind !== "indoor") })
  expect(source).toEqual(before)
})
it("recomputes components when the same map ids are registered with changed barriers", () => {
  const source = { phanthiet: map("phanthiet", "town"), "phanthiet-gate": map("phanthiet-gate", "field") }
  const connected = connectOutdoorMaps(source)
  expect(connected.phanthiet.warps).toHaveLength(1)
  const modified = { ...source, "phanthiet-gate": { ...source["phanthiet-gate"], rows: source["phanthiet-gate"].rows.map((row, index) => (index === 5 ? "#".repeat(24) : row)) } },
    before = structuredClone(modified)
  const disconnected = connectOutdoorMaps(modified)
  expect(disconnected.phanthiet.warps).toEqual([])
  expect(disconnected["phanthiet-gate"].warps).toEqual([])
  expect(connected.phanthiet.warps).toHaveLength(1)
  expect(modified).toEqual(before)
})
