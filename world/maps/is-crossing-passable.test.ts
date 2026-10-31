import { expect, it } from "vitest"
import { isCrossingPassable } from "#/world/maps/is-crossing-passable"
import { getLargestWalkableRegion } from "#/world/maps/get-largest-walkable-region"
import type { MapDefinition } from "#/world/maps/types"
import type { OutdoorCrossingContext } from "#/world/maps/outdoor-crossing-types"

const map = (id: string, size: number): MapDefinition => ({
  id,
  name: id,
  size,
  kind: "field",
  rows: Array.from({ length: size }, () => ".".repeat(size)),
  spawn: [8, 8],
  npcs: [],
  places: {},
  warps: [],
  assets: { sprites: "" },
})
const fixture = (): OutdoorCrossingContext => {
  const here = map("here", 32),
    there = map("there", 40)
  return { here, there, side: "s", hereLand: getLargestWalkableRegion(here), thereLand: getLargestWalkableRegion(there) }
}
it("indexes each endpoint with its own map width", () => {
  const context = fixture()
  expect(isCrossingPassable({ ...context, thereLand: new Set([3 * 40 + 12, 8 * 40 + 12]) }, 12)).toBe(true)
  expect(isCrossingPassable({ ...context, thereLand: new Set([3 * 32 + 12, 8 * 32 + 12]) }, 12)).toBe(false)
})
it.each(["here-trigger", "here-arrival", "there-trigger", "there-arrival"])("rejects a blocked %s even if a stale region includes it", (blocked) => {
  const context = fixture(),
    here = structuredClone(context.here),
    there = structuredClone(context.there)
  const target = blocked.startsWith("here") ? here : there
  const row = blocked === "here-trigger" ? 29 : blocked === "here-arrival" ? 24 : blocked === "there-trigger" ? 3 : 8
  target.rows = target.rows.map((line, index) => (index === row ? line.slice(0, 12) + "#" + line.slice(13) : line))
  expect(isCrossingPassable({ ...context, here, there }, 12)).toBe(false)
})
it("does not admit an out-of-range column through an aliased row key", () => {
  const context = fixture()
  const smaller = map("small", 20)
  expect(isCrossingPassable({ ...context, side: "n", there: smaller, thereLand: getLargestWalkableRegion(smaller) }, 25)).toBe(false)
})
