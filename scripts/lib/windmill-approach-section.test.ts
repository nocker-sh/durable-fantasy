import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
import { getWindmillApproachSection } from "#/scripts/lib/get-windmill-approach-section"
import { VILLAGE } from "#/world/maps/layout"
import { TILE_M } from "#/world/town/fit"
const fixture = () => {
  const document = readSetting(readFileSync(".docs/settings/facilities/facility-square-windmill.md", "utf8"))
  const review = getWindmillYardSiteReview({ document, fields: VILLAGE.fields, roads: VILLAGE.roads, metresPerTile: TILE_M })
  if (!review || review instanceof Error || !review.approach?.section) throw new Error("Missing windmill section study")
  return { document, review, terrain: new ScalarField(new Float32Array(10000).fill(0.25), 100) }
}
it("joins the reserved yard and turn to the road's measured datum without modifying the plan or terrain", () => {
  const source = fixture()
  const before = JSON.stringify([source.document, source.review, [...source.terrain.data]])
  const section = getWindmillApproachSection({ ...source, metresPerTile: TILE_M })
  if (!section || section instanceof Error) throw section ?? new Error("Missing section")
  expect(section.anchors.map((point) => point.elevation_m)).toEqual([0.6, 0.6, 0.25 * TILE_M])
  expect(section.anchors.map((point) => point.point)).toEqual(source.review.approach?.points)
  const final = section.anchor_segments[1]
  if (final instanceof Error) throw final
  expect(final.length_m).toBeCloseTo(Math.abs(section.anchors[2].point[0] - section.anchors[1].point[0]) * TILE_M, 12)
  expect(final.grade).toBeCloseTo(0.25 / final.length_m, 12)
  expect(section.scope).toBe("centreline_level_reservation")
  section.anchors[0].point[0] = 0
  expect(JSON.stringify([source.document, source.review, [...source.terrain.data]])).toBe(before)
  expect(source.document.design_gate).toBe("未通過")
})
it("rejects a yard below the full terrain peak and a section steeper than its declared reservation", () => {
  const source = fixture()
  source.terrain.data[343] = 1
  expect(getWindmillApproachSection({ ...source, metresPerTile: TILE_M })).toEqual(new Error("Windmill section yard is below existing terrain"))
  source.terrain.data.fill(0)
  expect(getWindmillApproachSection({ ...source, metresPerTile: TILE_M })).toEqual(new Error("Windmill approach exceeds its reserved centreline grade"))
})
it("refuses a field that cannot cover the approach and leaves old plans without a section unasserted", () => {
  const source = fixture()
  expect(() => getWindmillApproachSection({ ...source, terrain: new ScalarField(new Float32Array(9), 3), metresPerTile: TILE_M })).toThrow("exceeds sampled field")
  const approach = source.review.approach
  if (!approach) throw new Error("Missing approach")
  expect(getWindmillApproachSection({ ...source, review: { ...source.review, approach: { ...approach, section: null } }, metresPerTile: TILE_M })).toBeNull()
})

it("keeps the declared first leg level rather than accepting a different turn height with a small enough slope", () => {
  const source = fixture()
  const approach = source.review.approach
  if (!approach?.section) throw new Error("Missing section")
  const review = { ...source.review, approach: { ...approach, section: { ...approach.section, turn_elevation_m: 0.59 } } }
  expect(getWindmillApproachSection({ ...source, review, metresPerTile: TILE_M })).toEqual(new Error("Windmill section must keep its first leg level"))
})
