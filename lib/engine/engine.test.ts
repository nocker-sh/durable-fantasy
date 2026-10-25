import { describe, expect, it } from "vitest"
import { GridPathfinder } from "./pathfinder.ts"
import { Polyline } from "./polyline.ts"
import { ScalarField } from "./scalar-field.ts"
import { LoadTimer } from "./laps.ts"
import { Store } from "./store.ts"
import { Rng } from "./random.ts"

describe("map-independent engine", () => {
  it("routes around obstacles, observes live changes, and keeps grids independent", () => {
    const blocked = new Uint8Array(25)
    const paths = new GridPathfinder(blocked, 5)
    const other = new GridPathfinder(new Uint8Array(25), 5)
    for (let z = 0; z < 5; z++) blocked[z * 5 + 2] = 1
    expect(paths.find([0.5, 0.5], [4.5, 0.5], true)).toBeNull()
    expect(other.find([0.5, 0.5], [4.5, 0.5], true)).not.toBeNull()
    blocked[22] = 0
    const route = paths.find([0.5, 0.5], [4.5, 0.5], true)!
    expect(route).toContainEqual([2.5, 4.5])
    expect(route[0]).toEqual([0.5, 0.5])
    expect(route.at(-1)).toEqual([4.5, 0.5])
  })

  it("keeps diagonal corners closed and converts grid centers to world units", () => {
    const blocked = new Uint8Array([0, 1, 1, 0])
    expect(new GridPathfinder(blocked, 2).find([0.5, 0.5], [1.5, 1.5], true)).toBeNull()
    expect(new GridPathfinder(new Uint8Array(9), 3, 2).find([0.25, 0.25], [1.25, 0.25], true)).toEqual([
      [0.25, 0.25],
      [0.75, 0.25],
      [1.25, 0.25],
    ])
  })

  it("handles blocked destinations and retains exact free destinations after smoothing", () => {
    const blocked = new Uint8Array(25)
    blocked[12] = 1
    const paths = new GridPathfinder(blocked, 5)
    const route = paths.find([0.5, 0.5], [2.5, 2.5], true)!
    expect(route.at(-1)).not.toEqual([2.5, 2.5])
    expect(route.every(([x, z]) => !blocked[Math.floor(z) * 5 + Math.floor(x)])).toBe(true)
    expect(paths.find([0.5, 0.5], [4.2, 4.3])?.at(-1)).toEqual([4.2, 4.3])
  })

  it("interpolates a field at fractional coordinates, clamps edges, and reads live samples", () => {
    const data = new Float32Array([0, 2, 4, 6])
    const field = new ScalarField(data, 2, 2)
    expect(field.sample(0.25, 0.25)).toBe(3)
    expect(field.sample(-2, -3)).toBe(0)
    expect(field.sample(100, 100)).toBeCloseTo(5.994, 10)
    data[0] = 8
    expect(field.sample(0, 0)).toBe(8)
  })

  it("measures segment and endpoint distances and preserves curve endpoints", () => {
    const line: [number, number][] = [
      [0, 0],
      [4, 0],
    ]
    expect(Polyline.distance(2, 3, line)).toBe(3)
    expect(Polyline.distance(7, 4, line)).toBe(5)
    const curve = Polyline.catmull(line, 4)
    expect(curve[0]).toEqual([0, 0])
    expect(curve.at(-1)).toEqual([4, 0])
    expect(curve[2]).toEqual([2, 0])
  })

  it("times independent loads using the supplied clock", () => {
    let now = 100
    const timer = new LoadTimer(() => now)
    timer.begin("map")
    now = 112
    timer.mark("ground")
    now = 130
    const laps = timer.end("ready")
    expect(laps.slice(1)).toEqual([
      { step: "ground", at: 12, took: 12 },
      { step: "ready", at: 30, took: 18 },
    ])
    timer.begin("next")
    timer.mark("start")
    expect(laps).toHaveLength(3)
  })

  it("notifies store subscribers only on changes and supports unsubscribe", () => {
    const store = new Store(1)
    const seen: number[] = []
    const stop = store.subscribe(() => seen.push(store.get()))
    store.set(1)
    store.set((n) => n + 1)
    stop()
    store.set(3)
    expect(seen).toEqual([2])
  })

  it("keeps seeded randomness reproducible across independent instances", () => {
    const a = new Rng(42),
      b = new Rng(42)
    expect(Array.from({ length: 10 }, () => a.next())).toEqual(Array.from({ length: 10 }, () => b.next()))
  })
})
