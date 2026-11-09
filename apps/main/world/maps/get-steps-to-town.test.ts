import { expect, it } from "vitest"
import { getStepsToTown } from "#/world/maps/get-steps-to-town"
import type { MapDefinition } from "#/world/maps/types"

const map = (id: string, kind: MapDefinition["kind"], destinations: readonly string[]): MapDefinition => ({
  id,
  name: id,
  kind,
  size: 1,
  rows: ["."],
  spawn: [0, 0],
  places: {},
  npcs: [],
  assets: { sprites: "" },
  warps: destinations.map((destination) => ({ at: [0, 0], to: { map: destination, at: [0, 0] } })),
})
const all = () => true

it("counts the fewest ways out to the nearest town, through doors and fields alike", () => {
  const maps = {
    town: map("town", "town", ["inn", "meadow"]),
    inn: map("inn", "indoor", ["town"]),
    meadow: map("meadow", "field", ["town", "forest"]),
    forest: map("forest", "field", ["meadow", "pass"]),
    pass: map("pass", "field", ["forest", "city"]),
    city: map("city", "town", ["pass"]),
  }
  expect(Object.fromEntries(getStepsToTown({ maps, open: all }))).toEqual({ town: 0, city: 0, inn: 1, meadow: 1, pass: 1, forest: 2 })
})

it("measures the way home, not the way out, when a road runs one way", () => {
  const maps = {
    town: map("town", "town", ["out"]),
    out: map("out", "field", []),
    back: map("back", "field", ["town"]),
  }
  expect(Object.fromEntries(getStepsToTown({ maps, open: all }))).toEqual({ town: 0, back: 1 })
})

it("does not route the way home through a map that is not open", () => {
  const maps = {
    town: map("town", "town", ["shut", "near"]),
    shut: map("shut", "field", ["town", "far"]),
    near: map("near", "field", ["town", "mid"]),
    mid: map("mid", "field", ["near", "far"]),
    far: map("far", "field", ["shut", "mid"]),
  }
  expect(Object.fromEntries(getStepsToTown({ maps, open: (id) => id !== "shut" }))).toEqual({ town: 0, shut: 1, near: 1, mid: 2, far: 3 })
})
