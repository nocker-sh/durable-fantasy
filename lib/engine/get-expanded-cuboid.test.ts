import { expect, it } from "vitest"
import { getExpandedCuboid } from "./get-expanded-cuboid"
const box = { x0: 1, x1: 2, bottom: 0, top: 0.5, z0: 3, z1: 4 }

it("encloses displaced faces without mutating or shrinking the original solid", () => {
  const before = { ...box },
    expanded = getExpandedCuboid(box, 0.2)
  if (expanded instanceof Error) throw expanded
  expect(expanded).toEqual({ x0: 0.8, x1: 2.2, bottom: -0.2, top: 0.7, z0: 2.8, z1: 4.2 })
  expect(getExpandedCuboid(box, 0)).toEqual(box)
  expect(box).toEqual(before)
})

it("rejects invalid solids before expansion can hide them and rejects nonfinite space", () => {
  for (const margin of [-1, NaN, Infinity]) expect(getExpandedCuboid(box, margin)).toBeInstanceOf(Error)
  expect(getExpandedCuboid({ ...box, x1: box.x0 }, 1)).toBeInstanceOf(Error)
  expect(getExpandedCuboid({ ...box, x1: 1e308 }, 1e308)).toBeInstanceOf(Error)
})
