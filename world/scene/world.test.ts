import { afterEach, expect, it, vi } from "vitest"

afterEach(() => vi.resetModules())

it("defers default terrain calculation until its first sample", async () => {
  const world = await import("./world")
  expect(world.F.h.every((value) => value === 0)).toBe(true)
  const height = world.groundH(12, 18)
  expect(world.F.h.some((value) => value !== 0)).toBe(true)
  const before = world.fieldsNow()
  world.setLayout(world.VILLAGE)
  expect(world.groundH(12, 18)).toBe(height)
  expect(world.fieldsNow()).toEqual(before)
})

it("uses primed fields without calculating the unused default or selected layout", async () => {
  const world = await import("./world")
  const shape = vi.fn(() => {
    throw Error("Should use primed fields")
  })
  const layout = { ...world.VILLAGE, shape }
  const count = world.GRID_N ** 2
  const fields = {
    h: new Float32Array(count).fill(3),
    river: new Float32Array(count).fill(5),
    road: new Float32Array(count).fill(7),
    trail: new Float32Array(count).fill(9),
    roadKind: new Uint8Array(count).fill(2),
    plazaH: 3,
  }
  world.primeFields(layout, fields)
  expect(world.F.h.every((value) => value === 0)).toBe(true)
  world.setLayout(layout)
  expect([world.groundH(2, 2), world.riverD(2, 2), world.roadD(2, 2), world.trailD(2, 2), world.roadKind(2, 2)]).toEqual([3, 5, 7, 9, 2])
  expect(shape).not.toHaveBeenCalled()
})
