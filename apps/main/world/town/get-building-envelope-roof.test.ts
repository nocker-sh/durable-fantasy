import { expect, it } from "vitest"
import { getBuildingEnvelopeRoof } from "#/world/town/get-building-envelope-roof"
import source from "#/world/town/floorplan/authored/h-m5"
import { TILE_M } from "#/world/town/fit"

it("returns independently owned metric roof geometry without changing the envelope", () => {
  const site = structuredClone(source.exterior),
    before = structuredClone(site),
    roof = getBuildingEnvelopeRoof(site)
  expect(roof).toEqual({
    bounds: { x0: site.bounds[0] * TILE_M, z0: site.bounds[1] * TILE_M, x1: site.bounds[2] * TILE_M, z1: site.bounds[3] * TILE_M },
    eave: site.eaveY * TILE_M,
    ridge: site.ridgeY * TILE_M,
    overhang: site.overhang * TILE_M,
    ridgeAxis: site.ridgeAxis,
  })
  roof.bounds.x0 = 0
  expect(site).toEqual(before)
})
it.each(["extent", "collapsed", "height", "overhang"])("rejects unrepresentable metric roof geometry: %s", (invalid) => {
  const site = structuredClone(source.exterior)
  if (invalid === "extent") site.bounds = [-Number.MAX_VALUE, 0, Number.MAX_VALUE, 1]
  if (invalid === "collapsed") site.bounds = [1e16, 0, 1e16, 1]
  if (invalid === "height") site.ridgeY = Number.MAX_VALUE
  if (invalid === "overhang") site.overhang = Number.MAX_VALUE
  expect(() => getBuildingEnvelopeRoof(site)).toThrow("Invalid authored roof envelope")
})
