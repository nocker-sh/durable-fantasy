import { expect, it } from "vitest"
import { townAnimalSpawns } from "./animals"
import { Rng } from "../../lib/engine/random"
it("preserves the town's existing population, sprite variants and areas", () => {
  const animals = townAnimalSpawns()
  expect(animals).toHaveLength(23)
  expect(new Set(animals.map((a) => a.id)).size).toBe(23)
  expect(animals.filter((a) => a.kind === "hen").map((a) => a.variant)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  expect(
    animals
      .filter((a) => a.kind === "hen")
      .slice(0, 6)
      .every((a) => JSON.stringify(a.area) === JSON.stringify([36.2, 17.9, 40.2, 21.5])),
  ).toBe(true)
  expect(animals.filter((a) => a.kind === "cat").map((a) => a.area)).toEqual([
    [14.4, 21.8, 17.4, 23.4],
    [20, 26.6, 24, 28],
    [12, 32, 17, 33.4],
  ])
})
it("preserves the random sequence used by pig and sheep speeds", () => {
  const random = new Rng(5),
    animals = townAnimalSpawns()
  expect(animals.filter((a) => a.kind === "pig").map((a) => a.speed)).toEqual(Array.from({ length: 4 }, () => 0.35 + random.next() * 0.2))
  expect(animals.filter((a) => a.kind === "sheep").map((a) => a.speed)).toEqual(Array.from({ length: 7 }, () => 0.3 + random.next() * 0.15))
})
it("does not share mutable habitat arrays between scene builds", () => {
  const first = townAnimalSpawns(),
    second = townAnimalSpawns()
  first[0].area[0] = -100
  expect(second[0].area[0]).toBe(36.2)
})

it("assigns animals to one map rather than copying a town population into other districts", () => {
  const all = townAnimalSpawns()
  expect(all.every((a) => a.map === "phanthiet")).toBe(true)
  expect(townAnimalSpawns("phanthiet")).toEqual(all)
  expect(townAnimalSpawns("phanthiet-market")).toEqual([])
  expect(townAnimalSpawns("south-meadow")).toEqual([])
})
