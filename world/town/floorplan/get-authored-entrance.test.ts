import { expect, it } from "vitest"
import generated from "#/world/town/floorplan/authored/h-m5"
import { getAuthoredEntrance } from "#/world/town/floorplan/get-authored-entrance"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

type Case = Readonly<{ side: AuthoredPlan["entrySide"]; entry: AuthoredPlan["entry"]; point: readonly [number, number]; outward: readonly [number, number] }>
const walls: readonly Case[] = [
  { side: "n", entry: [4.5, 0], point: [2.5, 0], outward: [0, -1] },
  { side: "s", entry: [4.5, 19], point: [2.5, 10], outward: [0, 1] },
  { side: "w", entry: [0, 4.5], point: [0, 2.5], outward: [-1, 0] },
  { side: "e", entry: [17, 4.5], point: [9, 2.5], outward: [1, 0] },
]

it.each(walls)("projects the opening center onto the $side exterior wall", (wall) => {
  const source: AuthoredPlan = { ...generated, entryWidth: 2, entry: wall.entry, entrySide: wall.side }
  const snapshot = structuredClone(source)
  const entrance = getAuthoredEntrance(source)
  expect(entrance.opening).toEqual({ point: wall.point, outward: wall.outward })
  expect([entrance.start, entrance.end]).toEqual([4, 6])
  expect(source).toEqual(snapshot)
})

it("rejects an opening across a corner, on an inner row or between cell spans", () => {
  for (const entry of [
    [0.5, 19],
    [4.5, 18],
    [4.25, 19],
  ]) {
    const source = structuredClone(generated)
    Object.assign(source, { entry, entrySide: "s", entryWidth: 2 })
    expect(() => getAuthoredEntrance(source)).toThrow("must fit one exterior wall")
  }
})
