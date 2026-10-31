import { expect, it } from "vitest"
import { serializeMapSnapshot } from "#/scripts/lib/serialize-map-snapshot"

it("writes blocked and free cells in row order and preserves named places", () => {
  const snapshot = { id: "map", size: 2, blocked: "0110", places: { door: [1, 1] } }
  expect(JSON.parse(serializeMapSnapshot({ map: "map", snapshot }))).toEqual({ size: 2, rows: [".#", "#."], places: { door: [1, 1] } })
  expect(serializeMapSnapshot({ map: "map", snapshot }).endsWith("\n")).toBe(true)
})

it("refuses another map and malformed grid dimensions or cells", () => {
  const snapshot = { id: "map", size: 2, blocked: "0110", places: {} }
  expect(() => serializeMapSnapshot({ map: "other", snapshot })).toThrow("different map")
  for (const invalid of [{ size: 0 }, { size: 1.5 }, { blocked: "01" }, { blocked: "01x0" }]) {
    expect(() => serializeMapSnapshot({ map: "map", snapshot: { ...snapshot, ...invalid } })).toThrow("Invalid walk grid")
  }
})
