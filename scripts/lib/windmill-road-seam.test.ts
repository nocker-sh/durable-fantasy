import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
import { getWindmillRoadSeam } from "#/scripts/lib/get-windmill-road-seam"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { TILE_M } from "#/world/town/fit"
const fixture = () => {
  const document = readSetting(readFileSync(".docs/settings/facilities/facility-square-windmill.md", "utf8"))
  const review = getWindmillYardSiteReview({ document, fields: SQUARE_LAYOUT.fields, roads: SQUARE_LAYOUT.roads, metresPerTile: TILE_M })
  if (!review || review instanceof Error || !review.approach) throw new Error("Missing windmill approach")
  const samples = new Float32Array(25)
  return {
    samples,
    approach: {
      ...review.approach,
      points: [
        [1, 1],
        [2, 2],
        [1, 2],
      ],
      widthM: 2,
    },
    terrain: new ScalarField({ samples, size: 5 }),
    metresPerTile: 1,
    levelM: 1,
  }
}
it("finds an interior peak along the entire seam and reports both cutting and filling without grading the field", () => {
  const source = fixture()
  source.samples[6] = 1
  source.samples[11] = 4
  source.samples[16] = -2
  const before = JSON.stringify([source.approach, [...source.samples]])
  const seam = getWindmillRoadSeam(source)
  expect(seam).toEqual({ scope: "ungraded_road_join", bounds: [1, 1, 1, 3], minimum_m: -2, maximum_m: 4, cut_m: 3, fill_m: 3 })
  expect(JSON.stringify([source.approach, [...source.samples]])).toBe(before)
})
it("uses metres for the road width and vertical datum, including clipped grid cells", () => {
  const source = fixture()
  source.samples.fill(0.25)
  expect(getWindmillRoadSeam({ ...source, metresPerTile: 2, levelM: 0.5 })).toEqual({ scope: "ungraded_road_join", bounds: [1, 1.5, 1, 2.5], minimum_m: 0.5, maximum_m: 0.5, cut_m: 0, fill_m: 0 })
})
it("refuses missing field coverage, a different final-leg orientation and invalid scales", () => {
  const source = fixture()
  expect(getWindmillRoadSeam({ ...source, approach: { ...source.approach, widthM: 6 } })).toEqual(new Error("Windmill road seam exceeds sampled terrain"))
  expect(
    getWindmillRoadSeam({
      ...source,
      approach: {
        ...source.approach,
        points: [
          [1, 1],
          [1, 2],
          [1, 3],
        ],
      },
    }),
  ).toEqual(new Error("Windmill road seam needs the reserved east-west final leg"))
  for (const metresPerTile of [0, -1, NaN, Infinity]) expect(getWindmillRoadSeam({ ...source, metresPerTile })).toEqual(new Error("Invalid windmill road seam"))
})

it("rejects height conversion overflow instead of reporting an infinite earthwork reservation", () => {
  const source = fixture()
  source.samples.fill(2)
  expect(getWindmillRoadSeam({ ...source, metresPerTile: 1e308 })).toEqual(new Error("Unbounded windmill road seam heights"))
})
