import { expect, it } from "vitest"
import { projectInteriorWindow } from "#/world/town/project-interior-window"
import type { WindowFixture } from "#/world/town/room-fixtures"
import type { Cell } from "#/world/town/interiors"

const window: WindowFixture = { id: "window", floor: 0, side: "n", along: 3, width: 1.2, sill: 0.8, height: 1.5, frame: 0.1 }
const bounds = { x0: 10, z0: 20, x1: 30, z1: 40 }
const cases: readonly { side: WindowFixture["side"]; point: Cell; outward: Cell }[] = [
  { side: "n", point: [16, 20], outward: [0, -1] },
  { side: "s", point: [16, 40], outward: [0, 1] },
  { side: "w", point: [10, 26], outward: [-1, 0] },
  { side: "e", point: [30, 26], outward: [1, 0] },
]
it.each(cases)("projects measured dimensions once on the $side wall", (input) => {
  const source = { ...window, side: input.side },
    original = structuredClone(source)
  expect(projectInteriorWindow({ window: source, bounds, scale: 2, wallMetres: 0.5 })).toEqual({
    id: "window",
    point: input.point,
    outward: input.outward,
    width: 2.4,
    sill: 1.6,
    height: 3,
    frame: 0.2,
    depth: 1,
  })
  expect(source).toEqual(original)
})
it("retains the window identity when finite dimensions overflow during conversion", () => {
  expect(() => projectInteriorWindow({ window: { ...window, width: Number.MAX_VALUE }, bounds, scale: 2, wallMetres: 0.5 })).toThrow("Invalid projected interior window: window")
})
