import { expect, it, vi } from "vitest"
import { INDOOR } from "#/world/maps/layouts/indoor"
import { Polyline } from "#/lib/engine/polyline"
import { baseH } from "#/world/maps/ground/base-h"
import { getPlazaGroundHeight } from "#/world/maps/ground/get-plaza-ground-height"
import { getTerraceGroundHeight } from "#/world/maps/ground/get-terrace-ground-height"
import { getRiverGroundHeight } from "#/world/maps/ground/get-river-ground-height"
import { getLavoirGroundHeight } from "#/world/maps/ground/get-lavoir-ground-height"
import { getShapedGroundHeight } from "#/world/maps/ground/get-shaped-ground-height"

it("holds the plaza level inside its radius and retains base ground beyond the blend", () => {
  const layout = { ...INDOOR, plaza: [10, 20] satisfies [number, number], plazaR: 3 }
  expect(getPlazaGroundHeight({ layout, x: 10, z: 20, plazaHeight: 2 }, 8)).toBe(2)
  expect(getPlazaGroundHeight({ layout, x: 16, z: 20, plazaHeight: 2 }, 8)).toBe(8)
})

it("lets the stair ramp override the terrace and retains its east-open boundary", () => {
  const layout = { ...INDOOR, terrace: { x0: 0, z0: 0, x1: 4, z1: 4, h: 2 }, stairs: { x0: 1, z0: 2, x1: 3, z1: 4 } }
  expect(getTerraceGroundHeight({ layout, x: 2, z: 2 }, 8)).toBe(2)
  expect(getTerraceGroundHeight({ layout, x: 2, z: 4 }, 8)).toBeCloseTo(baseH(2, 4.1, layout), 12)
  expect(getTerraceGroundHeight({ layout, x: 3, z: 2 }, 8)).toBe(2 + (8 - 0.1) * 0.25)
})

it("keeps the river bed, its bank start and undisturbed ground separate", () => {
  const context = { layout: INDOOR, z: 24, riverDistance: 0 }
  expect(getRiverGroundHeight(context, 4)).toBe(-1.55)
  expect(getRiverGroundHeight({ ...context, riverDistance: INDOOR.riverHW }, 4)).toBe(-1.2)
  expect(getRiverGroundHeight({ ...context, riverDistance: 10 }, 4)).toBe(4)
})

it("keeps the wash ledge outside the river and lets its stair ramp override it", () => {
  const layout = { ...INDOOR, lavoir: { x0: 0, z0: 0, x1: 4, z1: 4, h: -0.7 }, lavStairs: { x0: 1, z0: 2, x1: 3, z1: 4 } }
  const context = { layout, x: 0.5, z: 1, riverDistance: 0 }
  expect(getLavoirGroundHeight(context, 5)).toBe(5)
  expect(getLavoirGroundHeight({ ...context, riverDistance: 2 }, 5)).toBe(-0.7)
  expect(getLavoirGroundHeight({ ...context, x: 2, z: 2 }, 5)).toBe(-0.7)
})

it("protects exact roads while passing sampled road distance to the map shape", () => {
  const shape = vi.fn(() => 9)
  const sample = vi.fn(() => 7)
  const layout = { ...INDOOR, shape }
  const roads = [
    {
      path: new Polyline([
        [0, 0],
        [10, 0],
      ]),
      width: 1,
      kind: 2,
    },
  ]
  const context = { layout, x: 5, z: 0, roads, roadField: { sample } }
  expect(getShapedGroundHeight(context, 2)).toBe(2)
  expect(shape).toHaveBeenCalledWith({ x: 5, z: 0, h: 2, roadD: 7 })
  expect(getShapedGroundHeight({ ...context, z: 10 }, 2)).toBe(9)
  sample.mockClear()
  expect(getShapedGroundHeight({ ...context, layout: INDOOR }, 2)).toBe(2)
  expect(sample).not.toHaveBeenCalled()
})
