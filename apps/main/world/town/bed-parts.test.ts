import { expect, it } from "vitest"
import { bedParts } from "#/world/town/bed-parts"
import { scaleBed } from "#/world/town/scale-bed"
import type { BedSpec } from "#/world/town/bed-types"
const bed: BedSpec = { frameHeight: 0.38, deckThickness: 0.025, railWidth: 0.05, railHeight: 0.14, legWidth: 0.06, headHeight: 0.8, mattressThickness: 0.12, headSide: "n", linen: null }
it("supports the deck on floor-standing legs and leaves the mattress inside its frame", () => {
  const parts = bedParts({ at: [0, 0], size: [1, 2], floor: 3, bed }),
    legs = parts.slice(0, 4),
    deck = parts.find((p) => p.kind === "deck")!,
    mattress = parts.find((p) => p.kind === "mattress")!
  expect(legs).toHaveLength(4)
  for (const leg of legs) {
    expect(leg.y0).toBe(3)
    expect(leg.y1).toBeCloseTo(deck.y0)
    expect(Math.min(leg.x1, deck.x1) - Math.max(leg.x0, deck.x0)).toBeGreaterThan(0)
    expect(Math.min(leg.z1, deck.z1) - Math.max(leg.z0, deck.z0)).toBeGreaterThan(0)
  }
  expect(mattress.y0).toBe(deck.y1)
  expect(mattress.x1 - mattress.x0).toBeCloseTo(0.9)
  expect(mattress.z1 - mattress.z0).toBeCloseTo(1.9)
  expect(mattress.y1).toBeCloseTo(3.5)
  for (const part of parts) expect([part.x1 - part.x0, part.y1 - part.y0, part.z1 - part.z0].every((n) => n > 0)).toBe(true)
})
it("scales every physical dimension once and places the headboard on each specified side", () => {
  for (const headSide of ["n", "s", "w", "e"] as const) {
    const spec = { ...bed, headSide },
      base = bedParts({ at: [0, 0], size: [1, 2], floor: 0, bed: spec }),
      scaled = bedParts({ at: [0, 0], size: [1.5, 3], floor: 0, bed: scaleBed(spec, 1.5) })
    for (let i = 0; i < base.length; i++) for (const key of ["x0", "y0", "z0", "x1", "y1", "z1"] as const) expect(scaled[i][key]).toBeCloseTo(base[i][key] * 1.5)
    const head = base.at(-1)!
    expect(head.y1).toBe(0.8)
    if (headSide === "n") expect(head.z0).toBe(-1)
    if (headSide === "s") expect(head.z1).toBe(1)
    if (headSide === "w") expect(head.x0).toBe(-0.5)
    if (headSide === "e") expect(head.x1).toBe(0.5)
  }
})
it("rejects collapsed frames and headboards buried in bedding", () => {
  for (const change of [{ railWidth: 0.5 }, { legWidth: 0.5 }, { deckThickness: 0.4 }, { headHeight: 0.45 }, { mattressThickness: NaN }])
    expect(() => bedParts({ at: [0, 0], size: [1, 2], floor: 0, bed: { ...bed, ...change } })).toThrow("Invalid bed")
})
