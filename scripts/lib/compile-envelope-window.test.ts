import { expect, it } from "vitest"
import { SpatialFrame } from "#/lib/engine/spatial-frame"
import { compileEnvelopeWindow } from "#/scripts/lib/compile-envelope-window"
import type { WindowFixture } from "#/world/town/room-fixtures"

function fixture(): Parameters<typeof compileEnvelopeWindow>[0] {
  return {
    window: { id: "upper", floor: 1, side: "n", along: 4, width: 1.2, height: 1.6, sill: 1.2, frame: 0.08 },
    frame: new SpatialFrame({ origin: [10, 3, 20], width: 4, depth: 3, quarterTurns: 0 }),
    floorLevels: [
      { floor: 0, elevation: 0 },
      { floor: 1, elevation: 4 },
    ],
    widthMetres: 8,
    depthMetres: 6,
    wallMetres: 0.5,
    metresPerTile: 2,
  }
}

it.each([0, 1, 2, 3])("keeps window positions on the same building frame at rotation %s", (rotation) => {
  const source = fixture()
  const frame = new SpatialFrame({ origin: [10, 3, 20], width: 4, depth: 3, quarterTurns: rotation })
  const sides: WindowFixture["side"][] = ["n", "e", "s", "w"]
  for (const side of sides) {
    const window = compileEnvelopeWindow({ ...source, frame, window: { ...source.window, side } })
    expect(window.sill).toBe(2.6)
    expect(3 + window.sill).toBeCloseTo(5.6)
    expect(window.width).toBe(0.6)
    expect(window.height).toBe(0.8)
    const local = frame.toLocal([window.point[0], 3 + window.sill, window.point[1]])
    expect(local[1]).toBeCloseTo(2.6)
    if (side === "n") expect(local[2]).toBe(0)
    if (side === "s") expect(local[2]).toBe(3)
    if (side === "w") expect(local[0]).toBe(0)
    if (side === "e") expect(local[0]).toBe(4)
    expect(Math.abs(window.outward[0]) + Math.abs(window.outward[1])).toBe(1)
  }
})

it("rejects missing, duplicated and nonfinite floor elevations", () => {
  const source = fixture()
  for (const floorLevels of [
    [],
    [
      { floor: 1, elevation: 4 },
      { floor: 1, elevation: 5 },
    ],
    [{ floor: 1, elevation: Infinity }],
  ]) {
    expect(() => compileEnvelopeWindow({ ...source, floorLevels })).toThrow("no unique floor elevation")
  }
})

it("does not compile a finite point with overflowing dimensions", () => {
  const source = fixture()
  expect(() => compileEnvelopeWindow({ ...source, window: { ...source.window, width: Number.MAX_VALUE }, metresPerTile: 0.5 })).toThrow("unbounded position")
  expect(() => compileEnvelopeWindow({ ...source, metresPerTile: 0 })).toThrow(RangeError)
})

it("rejects overflow when individually finite foundation and storey heights are combined", () => {
  const source = fixture()
  const frame = new SpatialFrame({ origin: [0, 1e308, 0], width: 4, depth: 3, quarterTurns: 0 })
  expect(() => compileEnvelopeWindow({ ...source, frame, metresPerTile: 1, floorLevels: [{ floor: 1, elevation: 1e308 }], window: { ...source.window, sill: 0 } })).toThrow("unbounded position")
})
