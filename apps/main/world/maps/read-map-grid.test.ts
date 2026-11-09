import { expect, it } from "vitest"
import { readMapGrid } from "#/world/maps/read-map-grid"

const fixture = () => ({ size: 2, rows: [".#", ".."], places: { landmark: [1, 0] } })
it("reads exact pairs including blocked landmarks without changing source data", () => {
  const source = fixture(),
    before = structuredClone(source)
  expect(readMapGrid("map", source)).toEqual({ ...source, npcs: [] })
  expect(source).toEqual(before)
})
it("owns parsed rows and coordinate pairs independently from the JSON object", () => {
  const source = fixture(),
    parsed = readMapGrid("map", source)
  source.rows[0] = "##"
  source.places.landmark[0] = 0
  expect(parsed.rows[0]).toBe(".#")
  expect(parsed.places.landmark).toEqual([1, 0])
})
it("creates independent empty place tables only when the table is absent", () => {
  const first = readMapGrid("a", { size: 1, rows: ["."] }),
    second = readMapGrid("b", { size: 1, rows: ["."] })
  Object.assign(first.places, { injected: [0, 0] })
  expect(second.places).toEqual({})
  expect(() => readMapGrid("map", { size: 1, rows: ["."], places: null })).toThrow("Invalid map grid: map")
})
it.each([[0], [0, 1, 2], [0.5, 1], ["0", 1], [-1, 0], [2, 0], [0, 2], [NaN, 0], [Infinity, 0]].map((cell) => ({ cell })))("rejects malformed or out-of-bounds named cells: %j", (input) => {
  expect(() => readMapGrid("map", { ...fixture(), places: { bad: input.cell } })).toThrow(/Invalid map (grid|place): map/)
})
it.each([0, 1.5, "2", Infinity, Number.MAX_SAFE_INTEGER])("rejects invalid dimensions %s without coercion", (size) => {
  expect(() => readMapGrid("map", { ...fixture(), size })).toThrow(/Invalid map (walk )?grid: map/)
})
it.each([[".."], ["..", "."], ["..", ".?"]].map((rows) => ({ rows })))("rejects incomplete or unknown grid rows: %j", (input) => {
  expect(() => readMapGrid("map", { ...fixture(), rows: input.rows })).toThrow("Invalid map walk grid: map")
})
