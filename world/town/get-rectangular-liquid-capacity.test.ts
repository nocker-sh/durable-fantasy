import { expect, it } from "vitest"
import { getRectangularLiquidCapacity } from "#/world/town/get-rectangular-liquid-capacity"

const vessel = { innerMm: [450, 250, 450] satisfies readonly [number, number, number], wallMm: 20, bottomMm: 25, freeboardMm: 50, displacementMl: 5000 }

it("keeps walls, bottom, headroom and displaced wool out of the liquid capacity", () => {
  const before = JSON.stringify(vessel)
  expect(getRectangularLiquidCapacity(vessel)).toEqual({ outerMm: [490, 275, 490], capacityMl: 35500 })
  expect(JSON.stringify(vessel)).toBe(before)
})

it("rounds fractional millilitres down using exact products even above intermediate safe-number limits", () => {
  expect(getRectangularLiquidCapacity({ ...vessel, innerMm: [101, 102, 103], freeboardMm: 1, displacementMl: 0 })).toMatchObject({ capacityMl: 1050 })
  expect(getRectangularLiquidCapacity({ ...vessel, innerMm: [300001, 300002, 300003], freeboardMm: 1, displacementMl: 0 })).toMatchObject({ capacityMl: 27000450002100 })
})

it("rejects overflow, invalid dimensions and contents that consume the whole working cavity", () => {
  for (const invalid of [0, -1, NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1]) expect(getRectangularLiquidCapacity({ ...vessel, wallMm: invalid })).toBeInstanceOf(Error)
  expect(getRectangularLiquidCapacity({ ...vessel, freeboardMm: 250 })).toBeInstanceOf(Error)
  expect(getRectangularLiquidCapacity({ ...vessel, displacementMl: 40500 })).toBeInstanceOf(Error)
  expect(getRectangularLiquidCapacity({ ...vessel, displacementMl: -1 })).toBeInstanceOf(Error)
  expect(getRectangularLiquidCapacity({ ...vessel, innerMm: [Number.MAX_SAFE_INTEGER, 250, 450] })).toBeInstanceOf(Error)
  expect(getRectangularLiquidCapacity({ ...vessel, innerMm: [300000000, 300000000, 300000000] })).toBeInstanceOf(Error)
})
