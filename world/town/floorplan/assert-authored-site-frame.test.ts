import { expect, it } from "vitest"
import { assertAuthoredSiteFrame } from "#/world/town/floorplan/assert-authored-site-frame"
import template from "#/world/town/floorplan/authored/h-m5"
import { TILE_M } from "#/world/town/fit"

it.each([0, 1, 2, 3])("matches the rotated exterior to physical building dimensions: %s", (quarterTurns) => {
  const source = structuredClone(template),
    site = source.exterior
  const width = (source.width * source.cellM) / TILE_M,
    depth = (source.depth * source.cellM) / TILE_M
  site.quarterTurns = quarterTurns
  site.bounds = [site.bounds[0], site.bounds[1], site.bounds[0] + (quarterTurns % 2 ? depth : width), site.bounds[1] + (quarterTurns % 2 ? width : depth)]
  const original = structuredClone(source)
  expect(() => assertAuthoredSiteFrame(source)).not.toThrow()
  expect(source).toEqual(original)
})
it.each(["collapsed", "nonfinite", "height"])("rejects an invalid physical site extent or origin: %s", (invalid) => {
  const source = structuredClone(template)
  if (invalid === "collapsed") source.exterior.bounds[2] = source.exterior.bounds[0]
  if (invalid === "nonfinite") source.exterior.bounds[3] = NaN
  if (invalid === "height") source.exterior.floorY = Number.MAX_VALUE
  expect(() => assertAuthoredSiteFrame(source)).toThrow("Invalid authored site frame")
})
