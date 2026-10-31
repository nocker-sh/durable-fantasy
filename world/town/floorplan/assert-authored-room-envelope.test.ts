import type { BuildingEnvelope } from "#/world/town/building-envelope"
import { expect, it } from "vitest"
import { assertAuthoredSiteFrame } from "#/world/town/floorplan/assert-authored-site-frame"
import source from "#/world/town/floorplan/authored/h-m5"
import { TILE_M } from "#/world/town/fit"

it("keeps the existing measured rooms inside their roof underside", () => {
  const plan = structuredClone(source),
    before = structuredClone(plan)
  expect(() => assertAuthoredSiteFrame(plan)).not.toThrow()
  expect(plan).toEqual(before)
})
it("rejects a flat ceiling extending above the roof ridge", () => {
  const plan = structuredClone(source),
    upper = plan.floorLevels.find((level) => level.floor === 1)
  if (!upper) throw new Error("Missing upper floor")
  upper.ceiling = (plan.exterior.ridgeY - plan.exterior.floorY) * TILE_M + 0.1
  expect(() => assertAuthoredSiteFrame(plan)).toThrow("Authored room exceeds exterior envelope")
})
it("checks the sloping roof at room edges instead of using ridge height for the whole room", () => {
  const plan = structuredClone(source)
  plan.exterior.eaveY -= 0.5
  expect(() => assertAuthoredSiteFrame(plan)).toThrow("Authored room exceeds exterior envelope")
})
it.each(["eave", "ridge", "below-floor", "reversed", "axis", "overhang"])("rejects invalid roof geometry: %s", (invalid) => {
  const plan = structuredClone(source)
  if (invalid === "eave") plan.exterior.eaveY = NaN
  if (invalid === "ridge") plan.exterior.ridgeY = Infinity
  if (invalid === "below-floor") plan.exterior.eaveY = plan.exterior.floorY - 1
  if (invalid === "reversed") plan.exterior.ridgeY = plan.exterior.eaveY - 1
  if (invalid === "axis") Reflect.set(plan.exterior, "ridgeAxis", "other")
  if (invalid === "overhang") plan.exterior.overhang = -1
  expect(() => assertAuthoredSiteFrame(plan)).toThrow("Invalid authored roof envelope")
})
it.each([0, 1, 2, 3])("allows a centred ceiling above the eaves but below the sloping roof after rotation %s", (quarterTurns) => {
  const plan = structuredClone(source),
    site: BuildingEnvelope = plan.exterior
  const width = (plan.width * plan.cellM) / TILE_M,
    depth = (plan.depth * plan.cellM) / TILE_M
  site.quarterTurns = quarterTurns
  site.ridgeAxis = quarterTurns % 2 ? "x" : "z"
  site.bounds = [site.bounds[0], site.bounds[1], site.bounds[0] + (quarterTurns % 2 ? depth : width), site.bounds[1] + (quarterTurns % 2 ? width : depth)]
  plan.floors = 1
  plan.floorLevels = [{ floor: 0, elevation: 0, ceiling: (site.eaveY - site.floorY) * TILE_M + 0.5, thickness: 0.2 }]
  plan.rooms = [{ ...plan.rooms[0], floor: 0, origin: [8, 9], rows: ["..", ".."] }]
  expect(() => assertAuthoredSiteFrame(plan)).not.toThrow()
})
it("does not place a ground-floor room below the explicitly measured building base", () => {
  const plan = structuredClone(source)
  plan.floorLevels[0].elevation = -0.1
  expect(() => assertAuthoredSiteFrame(plan)).toThrow("Authored room exceeds exterior envelope")
})
it.each([null, "4"])("rejects malformed roof heights without numeric coercion: %s", (height) => {
  const plan = structuredClone(source)
  Reflect.set(plan.exterior, "eaveY", height)
  expect(() => assertAuthoredSiteFrame(plan)).toThrow("Invalid authored roof envelope")
})
