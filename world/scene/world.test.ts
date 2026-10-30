import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { deepStrictEqual } from "node:assert"
import { afterEach, expect, it, vi } from "vitest"

afterEach(() => vi.resetModules())

it("defers default terrain calculation until its first sample", async () => {
  const world = {
    ...(await import("#/world/scene/world")),
    ...(await import("#/world/scene/river-x")),
    ...(await import("#/world/scene/in-rect")),
    ...(await import("#/world/scene/ensure-fields")),
    ...(await import("#/world/scene/current-layout")),
    ...(await import("#/world/scene/set-layout")),
    ...(await import("#/world/scene/fields-now")),
    ...(await import("#/world/scene/prime-fields")),
    ...(await import("#/world/scene/has-fields")),
    ...(await import("#/world/scene/ground-h")),
    ...(await import("#/world/scene/river-d")),
    ...(await import("#/world/scene/road-d")),
    ...(await import("#/world/scene/trail-d")),
    ...(await import("#/world/scene/road-kind")),
    ...(await import("#/world/scene/bridge-deck-h")),
    ...(await import("#/world/scene/set-walk-surfaces")),
    ...(await import("#/world/scene/add-walk-surfaces")),
    ...(await import("#/world/scene/walk-h")),
    ...(await import("#/world/scene/block-rect")),
    ...(await import("#/world/scene/block-circle")),
    ...(await import("#/world/scene/init-walk")),
    ...(await import("#/world/scene/is-free")),
  }
  expect(world.F.h.every((value) => value === 0)).toBe(true)
  const height = world.groundH(12, 18)
  expect(world.F.h.some((value) => value !== 0)).toBe(true)
  const before = world.fieldsNow()
  world.setLayout(SQUARE_LAYOUT)
  expect(world.groundH(12, 18)).toBe(height)
  deepStrictEqual(world.fieldsNow(), before)
})

it("uses primed fields without calculating the unused default or selected layout", async () => {
  const world = {
    ...(await import("#/world/scene/world")),
    ...(await import("#/world/scene/river-x")),
    ...(await import("#/world/scene/in-rect")),
    ...(await import("#/world/scene/ensure-fields")),
    ...(await import("#/world/scene/current-layout")),
    ...(await import("#/world/scene/set-layout")),
    ...(await import("#/world/scene/fields-now")),
    ...(await import("#/world/scene/prime-fields")),
    ...(await import("#/world/scene/has-fields")),
    ...(await import("#/world/scene/ground-h")),
    ...(await import("#/world/scene/river-d")),
    ...(await import("#/world/scene/road-d")),
    ...(await import("#/world/scene/trail-d")),
    ...(await import("#/world/scene/road-kind")),
    ...(await import("#/world/scene/bridge-deck-h")),
    ...(await import("#/world/scene/set-walk-surfaces")),
    ...(await import("#/world/scene/add-walk-surfaces")),
    ...(await import("#/world/scene/walk-h")),
    ...(await import("#/world/scene/block-rect")),
    ...(await import("#/world/scene/block-circle")),
    ...(await import("#/world/scene/init-walk")),
    ...(await import("#/world/scene/is-free")),
  }
  const shape = vi.fn(() => {
    throw Error("Should use primed fields")
  })
  const layout = { ...SQUARE_LAYOUT, shape }
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
