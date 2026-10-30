import { expect, it } from "vitest"
import { GridPathSearch } from "#/lib/engine/grid-path-search"

it("routes around a blocked diagonal side without cutting its corner", () => {
  const blocked = new Uint8Array([0, 1, 0, 0])
  const search = new GridPathSearch({ size: 2, resolution: 2, start: 0, goal: 3, blocked })
  expect(search.find()).toEqual([
    [0.25, 0.25],
    [0.25, 0.75],
    [0.75, 0.75],
  ])
  blocked[2] = 1
  expect(search.find()).toBeNull()
})

it("keeps each search independent of earlier results and reads current obstacles", () => {
  const blocked = new Uint8Array(25)
  const props = { size: 5, resolution: 1, start: 0, goal: 24, blocked }
  const search = new GridPathSearch(props)
  const expected = [
    [0.5, 0.5],
    [1.5, 1.5],
    [2.5, 2.5],
    [3.5, 3.5],
    [4.5, 4.5],
  ]
  expect(search.find()).toEqual(expected)
  search.find()?.splice(0)
  props.size = 1
  props.goal = 0
  expect(search.find()).toEqual(expected)
  for (const row of [0, 1, 2, 3, 4]) blocked[row * 5 + 2] = 1
  expect(search.find()).toBeNull()
  blocked.fill(0)
  expect(search.find()).toEqual(expected)
  expect(Object.isFrozen(search)).toBe(true)
})

it("returns a single center when the start already reaches the goal", () => {
  expect(new GridPathSearch({ size: 1, resolution: 4, start: 0, goal: 0, blocked: new Uint8Array(1) }).find()).toEqual([[0.125, 0.125]])
})

it.each([40, 320])("limits the long passage search without exhausting the region (size %i)", (size) => {
  const blocked = Uint8Array.from({ length: size ** 2 }, (_, cell) => {
    const x = cell % size
    const y = Math.floor(cell / size)
    if (y % 2 === 0) return 0
    const opening = Math.floor(y / 2) % 2 === 0 ? size - 1 : 0
    return Number(x !== opening)
  })
  const search = new GridPathSearch({ size, resolution: 1, start: 0, goal: (size - 2) * size, blocked })
  if (size === 40) expect(search.find()?.at(-1)).toEqual([0.5, size - 1.5])
  else expect(search.find()).toBeNull()
})
