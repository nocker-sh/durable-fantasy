import { expect, it } from "vitest"
import { getMonsterRoute } from "#/world/core/get-monster-route"
import { getMonsterRoutePosition } from "#/world/core/get-monster-route-position"
import { getGridSegmentCells } from "#/lib/engine/get-grid-segment-cells"
import { getMonsterSegmentError } from "#/world/core/get-monster-segment-error"
import { getMonsterFallbackHome } from "#/world/core/get-monster-fallback-home"
it("routes around a wall inside the unchanged territory and clears every crossed cell", () => {
  const free = (x: number, z: number) => !(Math.floor(x * 2) === 4 && z < 3)
  const route = getMonsterRoute({ from: [0.25, 1.25], to: [3.75, 1.25], area: [0, 0, 4, 4], radius: 0, free })
  if (route instanceof Error) throw route
  expect(route.distance).toBeGreaterThan(3.5)
  for (const index of route.points.keys()) {
    if (index === 0) continue
    for (const cell of getGridSegmentCells({ from: route.points[index - 1], to: route.points[index], cellSize: 0.5 })) expect(free((cell[0] + 0.5) / 2, (cell[1] + 0.5) / 2)).toBe(true)
  }
  expect(getMonsterRoutePosition({ route, into: 20000 })).toEqual({ x: 3.75, z: 1.25, moving: false })
})
it("fails explicitly for disconnected resting points instead of crossing a blocked stripe", () => {
  expect(getMonsterRoute({ from: [0.25, 1.25], to: [3.75, 1.25], area: [0, 0, 4, 4], radius: 0, free: (x) => Math.floor(x * 2) !== 4 })).toEqual(
    new Error("Monster territory has disconnected resting points"),
  )
})
it("finds a clear fallback cell even when the territory centre is blocked", () => {
  const home = getMonsterFallbackHome({ area: [0, 0, 2, 2], cellsPerTile: 2, free: (x, z) => x < 0.5 && z < 0.5 })
  expect(home).toEqual([0.25, 0.25])
  expect(getMonsterFallbackHome({ area: [0, 0, 2, 2], cellsPerTile: 2, free: () => false })).toEqual(new Error("Monster territory has no walkable resting point"))
})

it("finishes a long detour before its next movement epoch instead of jumping at the boundary", () => {
  const points: [number, number][] = [
    [0, 0],
    [30, 0],
  ]
  const route = { points, lengths: [30], distance: 30 }
  const before = getMonsterRoutePosition({ route, into: 19999 }),
    end = getMonsterRoutePosition({ route, into: 20000 })
  expect(end).toEqual({ x: 30, z: 0, moving: false })
  expect(end.x - before.x).toBeLessThan(0.002)
})

it("routes the body around an adjacent obstacle even when the centre line is clear", () => {
  const free = (x: number, z: number) => Math.floor(x * 2) !== 3 || Math.floor(z * 2) !== 2
  const route = getMonsterRoute({ from: [0.75, 0.75], to: [2.75, 0.75], area: [0, 0, 4, 4], radius: 0.27, free })
  if (route instanceof Error) throw route
  expect(route.distance).toBeGreaterThan(2)
  for (const index of route.points.keys()) {
    if (index === 0) continue
    expect(getMonsterSegmentError({ from: route.points[index - 1], to: route.points[index], radius: 0.27, free })).toBeNull()
  }
  expect(getMonsterRoute({ from: [1.75, 0.75], to: [2.75, 0.75], area: [0, 0, 4, 4], radius: 0.27, free })).toEqual(new Error("Monster resting footprint is blocked"))
})

it("queries a clear direct swept footprint once instead of rechecking its endpoints and the same segment", () => {
  const props = { from: [0.75, 0.75], to: [1.25, 0.75], area: [0, 0, 4, 4], radius: 0.1 } satisfies Omit<Parameters<typeof getMonsterRoute>[0], "free">
  const certificateQueries: [number, number][] = [],
    routeQueries: [number, number][] = []
  expect(
    getMonsterSegmentError({
      ...props,
      free: (x, z) => {
        certificateQueries.push([x, z])
        return true
      },
    }),
  ).toBeNull()
  const route = getMonsterRoute({
    ...props,
    free: (x, z) => {
      routeQueries.push([x, z])
      return true
    },
  })
  if (route instanceof Error) throw route
  expect(routeQueries).toEqual([props.from, props.to, ...certificateQueries])
  expect(route).toEqual({ points: [props.from, props.to], lengths: [0.5], distance: 0.5 })
})

it("checks a changed terrain callback again rather than retaining a prior clear certificate", () => {
  const terrain = { blocked: false },
    free = (x: number) => !terrain.blocked || Math.floor(x * 2) !== 4
  const props = { from: [0.25, 1.25], to: [3.75, 1.25], area: [0, 0, 4, 4], radius: 0, free } satisfies Parameters<typeof getMonsterRoute>[0]
  const clear = getMonsterRoute(props)
  if (clear instanceof Error) throw clear
  expect(clear.distance).toBe(3.5)
  terrain.blocked = true
  expect(getMonsterRoute(props)).toEqual(new Error("Monster territory has disconnected resting points"))
})

it("rejects invalid route bounds and out-of-territory endpoints before querying terrain", () => {
  const calls: [number, number][] = [],
    base = {
      from: [0.25, 1.25],
      to: [3.75, 1.25],
      area: [0, 0, 4, 4],
      radius: 0,
      free: (x: number, z: number) => {
        calls.push([x, z])
        return true
      },
    } satisfies Parameters<typeof getMonsterRoute>[0]
  const invalid: ReadonlyArray<Partial<Parameters<typeof getMonsterRoute>[0]>> = [
    { from: [NaN, 1] },
    { to: [1, Infinity] },
    { area: [0, 0, Infinity, 4] },
    { area: [4, 0, 0, 4] },
    { area: [0, 4, 4, 0] },
    { from: [-0.01, 1] },
    { to: [4.01, 1] },
    { radius: -1 },
    { radius: Infinity },
  ]
  for (const change of invalid) expect(getMonsterRoute({ ...base, ...change })).toEqual(new Error("Invalid monster route territory or endpoint"))
  expect(calls).toEqual([])
})

it("retains exact territory edges and a stationary single-point territory", () => {
  const route = getMonsterRoute({ from: [0, 0], to: [4, 4], area: [0, 0, 4, 4], radius: 0, free: () => true })
  if (route instanceof Error) throw route
  expect(route.points).toEqual([
    [0, 0],
    [4, 4],
  ])
  expect(getMonsterRoute({ from: [1, 1], to: [1, 1], area: [1, 1, 1, 1], radius: 0.2, free: () => true })).toEqual({
    points: [
      [1, 1],
      [1, 1],
    ],
    lengths: [0],
    distance: 0,
  })
})

it("returns a bounded failure for a centre segment beyond the coverage budget", () => {
  const queries: [number, number][] = []
  expect(
    getMonsterSegmentError({
      from: [0, 0],
      to: [100000, 0],
      radius: 0,
      free: (x, z) => {
        queries.push([x, z])
        return true
      },
    }),
  ).toEqual(new Error("Grid segment exceeds traversal budget"))
  expect(queries).toEqual([])
})

it("does not hide unexpected terrain failures as bounded geometry rejection", () => {
  const failure = new Error("Terrain source unavailable")
  expect(() =>
    getMonsterSegmentError({
      from: [0, 0],
      to: [1, 0],
      radius: 0,
      free: () => {
        throw failure
      },
    }),
  ).toThrow(failure)
})
