import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
import { getWindmillSiteTerrain } from "#/scripts/lib/get-windmill-site-terrain"
import { VILLAGE } from "#/world/maps/layout"
import { TILE_M } from "#/world/town/fit"
const fixture = () => {
  const document = readSetting(readFileSync(".docs/settings/facilities/facility-square-windmill.md", "utf8"))
  const review = getWindmillYardSiteReview({ document, fields: VILLAGE.fields, roads: VILLAGE.roads, metresPerTile: TILE_M })
  if (!review || review instanceof Error) throw review ?? new Error("Missing windmill study")
  return { document, review }
}
it("includes interior terrain extrema and the full approach without changing the study or terrain", () => {
  const source = fixture()
  const terrain = new ScalarField(new Float32Array(10000), 100)
  terrain.data[343] = 9
  terrain.data[1040] = -4
  const before = JSON.stringify(source)
  const heights = [...terrain.data]
  const regions = getWindmillSiteTerrain({ review: source.review, terrain, metresPerTile: TILE_M })
  expect(regions).toHaveLength(3)
  expect(regions[0].maximum_m).toBe(9 * TILE_M)
  expect(regions[0].minimum_m).toBe(0)
  expect(regions[2].minimum_m).toBe(-4 * TILE_M)
  expect(regions[2].relief_m).toBe(4 * TILE_M)
  expect(regions.map((region) => region.id)).toEqual([source.document.id, `${source.document.id}/approach-1`, `${source.document.id}/approach-2`])
  regions[0].bounds[0] = 0
  expect(JSON.stringify(source)).toBe(before)
  expect([...terrain.data]).toEqual(heights)
  expect(source.document.design_gate).toBe("未通過")
})
it("rejects missing field coverage and invalid scale instead of clamping a site into apparently flat ground", () => {
  const source = fixture()
  const terrain = new ScalarField(new Float32Array(9), 3)
  expect(() => getWindmillSiteTerrain({ review: source.review, terrain, metresPerTile: TILE_M })).toThrow("exceeds sampled field")
  for (const metresPerTile of [0, -1, NaN, Infinity]) expect(() => getWindmillSiteTerrain({ review: source.review, terrain, metresPerTile })).toThrow("Invalid terrain scale")
})
