import { expect, it } from "vitest"
import { getInteriorWalkSurfaces } from "#/world/town/get-interior-walk-surfaces"
import { inRect } from "#/lib/engine/in-rect"

it("keeps the stair opening empty while retaining the complete remaining floor area and height", () => {
  const interior = { x0: 10, z0: 20, x1: 18, z1: 28, floorOpenings: [{ x0: 12, z0: 22, x1: 14, z1: 24 }] },
    before = structuredClone(interior)
  const surfaces = getInteriorWalkSurfaces(interior, 3)
  expect(surfaces.every((surface) => surface.height === 3)).toBe(true)
  expect(surfaces.reduce((area, surface) => area + (surface.rect[2] - surface.rect[0]) * (surface.rect[3] - surface.rect[1]), 0)).toBe(60)
  expect(surfaces.some((surface) => inRect({ x: 13, z: 23, r: { x0: surface.rect[0], z0: surface.rect[1], x1: surface.rect[2], z1: surface.rect[3] } }))).toBe(false)
  expect(interior).toEqual(before)
})
it("keeps the full floor when it has no openings", () => {
  expect(getInteriorWalkSurfaces({ x0: 10, z0: 20, x1: 18, z1: 28 }, 3)).toEqual([{ rect: [10, 20, 18, 28], height: 3 }])
})
