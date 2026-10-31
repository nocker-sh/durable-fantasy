import { expect, it, vi } from "vitest"
import { Polyline } from "#/lib/engine/polyline"
import { getGroundRoadPaths } from "#/world/scene/helpers/world/get-ground-road-paths"
import { getRoadFieldSample } from "#/world/scene/helpers/world/get-road-field-sample"
import { getTrailFieldDistance } from "#/world/scene/helpers/world/get-trail-field-distance"
import { sampleGroundFieldCell } from "#/world/scene/helpers/world/sample-ground-field-cell"
import type { GroundFieldContext } from "#/world/scene/helpers/world/ground-field-types"
import type { Road } from "#/world/maps/layout-types"

it("snapshots road geometry while preserving widths and all three material codes", () => {
  const roads: Road[] = [
    {
      pts: [
        [0, 0],
        [10, 0],
      ],
      w: 2,
      kind: "cobble",
    },
    {
      pts: [
        [0, 20],
        [10, 20],
      ],
      w: 1,
      kind: "dirt",
    },
    {
      pts: [
        [0, 40],
        [10, 40],
      ],
      w: 0.5,
      kind: "pave",
    },
  ]
  const paths = getGroundRoadPaths(roads)
  expect(paths.map((path) => [path.width, path.kind])).toEqual([
    [2, 1],
    [1, 2],
    [0.5, 3],
  ])
  roads[0].pts[0][1] = 100
  expect(paths[0].path.distance(5, 0)).toBe(0)
})

it("keeps distance and material from the same winning road and retains the first tie", () => {
  const path = new Polyline([
    [0, 0],
    [10, 0],
  ])
  const roads = [
    { path, width: 2, kind: 1 },
    { path, width: 2, kind: 3 },
  ]
  const sample = getRoadFieldSample(5, 0, { seed: 7, roads })
  expect(sample.kind).toBe(1)
  expect(sample.distance).toBeLessThan(0)
  const farther = {
    path: new Polyline([
      [0, 20],
      [10, 20],
    ]),
    width: 2,
    kind: 3,
  }
  expect(getRoadFieldSample(5, 0, { seed: 7, roads: [farther, roads[0]] }).kind).toBe(1)
  expect(getRoadFieldSample(5, 0, { seed: 7, roads: [] })).toEqual({ distance: 1e9, kind: 0 })
})

it("keeps the missing-trail sentinel and the nearest of crossing trails", () => {
  const trails = [
    new Polyline([
      [0, 0],
      [10, 0],
    ]),
    new Polyline([
      [5, -5],
      [5, 5],
    ]),
  ]
  expect(getTrailFieldDistance(5, 2, trails)).toBe(0)
  expect(getTrailFieldDistance(2, 2, trails)).toBe(2)
  expect(getTrailFieldDistance(2, 2, [])).toBe(1e9)
})

it("writes distance, trail and material fields before sampling height at the row-first cell", () => {
  const fields = { h: new Float32Array(4), river: new Float32Array(4).fill(-99), road: new Float32Array(4).fill(-99), trail: new Float32Array(4).fill(-99), roadKind: new Uint8Array(4).fill(255) }
  const heightAt = vi.fn(() => {
    expect(fields.river[2]).toBe(0)
    expect(fields.road[2]).toBe(1e9)
    expect(fields.trail[2]).toBe(2)
    expect(fields.roadKind[2]).toBe(0)
    expect(fields.h[2]).toBe(0)
    return 42
  })
  const context: GroundFieldContext = {
    fields,
    river: new Polyline([
      [0, 0],
      [0, 4],
    ]),
    trails: [
      new Polyline([
        [0, 0],
        [4, 0],
      ]),
    ],
    roads: [],
    seed: 7,
    size: 2,
    resolution: 0.5,
    heightAt,
  }
  sampleGroundFieldCell(1, 0, context)
  expect(heightAt).toHaveBeenCalledExactlyOnceWith({ x: 0, z: 2, dr: 0, roads: context.roads })
  expect([...fields.h]).toEqual([0, 0, 42, 0])
})
