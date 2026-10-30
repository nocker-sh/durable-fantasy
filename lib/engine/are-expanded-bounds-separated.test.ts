import { expect, it } from "vitest"
import { areExpandedBoundsSeparated } from "./are-expanded-bounds-separated"

const moving = { min: [0, 0, 0], max: [1, 1, 1] } as const

it("retains the complete margin and touching boundary along every axis", () => {
  for (const axis of [0, 1, 2] as const) {
    const fixed: { min: [number, number, number]; max: [number, number, number] } = { min: [0, 0, 0], max: [1, 1, 1] }
    fixed.min[axis] = 1.5
    fixed.max[axis] = 2.5
    const before = structuredClone(fixed)
    expect(areExpandedBoundsSeparated({ moving, fixed, margin: 0.5 })).toBe(false)
    expect(areExpandedBoundsSeparated({ moving, fixed, margin: 0.49 })).toBe(true)
    expect(areExpandedBoundsSeparated({ moving: fixed, fixed: moving, margin: 0.49 })).toBe(true)
    expect(areExpandedBoundsSeparated({ moving: fixed, fixed: moving, margin: 0.5 })).toBe(false)
    expect(fixed).toEqual(before)
  }
})

it("refuses invalid bounds or margins even when another axis appears separated", () => {
  const fixed = { min: [5, 5, 5], max: [6, 6, 6] } as const
  for (const margin of [-1, NaN, Infinity]) expect(areExpandedBoundsSeparated({ moving, fixed, margin })).toBe(false)
  for (const invalid of [NaN, Infinity, -Infinity]) expect(areExpandedBoundsSeparated({ moving: { ...moving, min: [invalid, 0, 0] }, fixed, margin: 0 })).toBe(false)
  expect(areExpandedBoundsSeparated({ moving: { ...moving, min: [2, 0, 0] }, fixed, margin: 0 })).toBe(false)
  expect(areExpandedBoundsSeparated({ moving, fixed: { ...fixed, max: [4, 6, 6] }, margin: 0 })).toBe(false)
})
