import { expect, it } from "vitest"
import { createMaps } from "#/world/maps/create-maps"
import { MAPS } from "#/world/maps"
import { OUTDOOR_MAP_DEFINITIONS } from "#/world/maps/outdoor-map-definitions"

it("rebuilds the complete registry without changing source map definitions", () => {
  const source = structuredClone(OUTDOOR_MAP_DEFINITIONS)
  expect(createMaps()).toEqual(MAPS)
  expect(OUTDOOR_MAP_DEFINITIONS).toEqual(source)
})
it("keeps independently assembled map records, NPC lists and mutable asset settings separate", () => {
  const first = createMaps(),
    second = createMaps(),
    before = structuredClone(MAPS),
    source = structuredClone(OUTDOOR_MAP_DEFINITIONS)
  first.phanthiet.spawn = [0, 0]
  first.phanthiet.npcs = []
  first.phanthiet.warps = []
  first.phanthiet.assets.sprites = "/other-sprites"
  expect(second).toEqual(before)
  expect(MAPS).toEqual(before)
  expect(OUTDOOR_MAP_DEFINITIONS).toEqual(source)
})
