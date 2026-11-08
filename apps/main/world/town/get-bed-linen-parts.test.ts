import { expect, it } from "vitest"
import { bedParts } from "#/world/town/bed-parts"
import { getBedLinenParts } from "#/world/town/get-bed-linen-parts"
import { scaleBed } from "#/world/town/scale-bed"
import type { BedSpec, BedLinenItem } from "#/world/town/bed-types"
const linen: readonly BedLinenItem[] = [
  { id: "bed:pillow", kind: "pillow", across: 0.2, fromHead: 0.08, width: 0.5, length: 0.3, thickness: 0.08 },
  { id: "bed:blanket", kind: "blanket", across: 0.02, fromHead: 0.54, width: 0.86, length: 1.32, thickness: 0.025 },
]
const bed: BedSpec = { frameHeight: 0.4, deckThickness: 0.025, railWidth: 0.05, railHeight: 0.12, legWidth: 0.06, headHeight: 0.8, mattressThickness: 0.1, headSide: "n", linen }

it("supports both made-bed pieces on the actual mattress for all four headboard directions", () => {
  for (const side of ["n", "s", "w", "e"] satisfies BedSpec["headSide"][]) {
    const alongX = side === "e" || side === "w",
      size: readonly [number, number] = alongX ? [2, 1] : [1, 2],
      spec = { ...bed, headSide: side },
      parts = bedParts({ at: [2, 3], size, floor: 0.2, bed: spec }),
      mattress = parts.find((piece) => piece.kind === "mattress"),
      pillow = parts.find((piece) => piece.kind === "pillow"),
      blanket = parts.find((piece) => piece.kind === "blanket")
    if (!mattress || !pillow || !blanket) throw new Error("Missing made-bed parts")
    expect(parts).toHaveLength(13)
    for (const piece of [pillow, blanket]) {
      expect(piece.y0).toBeCloseTo(mattress.y1, 12)
      expect(piece.x0).toBeGreaterThan(mattress.x0)
      expect(piece.x1).toBeLessThan(mattress.x1)
      expect(piece.z0).toBeGreaterThan(mattress.z0)
      expect(piece.z1).toBeLessThan(mattress.z1)
    }
    if (side === "n") expect(pillow.z1).toBeLessThan(blanket.z0)
    if (side === "s") expect(pillow.z0).toBeGreaterThan(blanket.z1)
    if (side === "w") expect(pillow.x1).toBeLessThan(blanket.x0)
    if (side === "e") expect(pillow.x0).toBeGreaterThan(blanket.x1)
  }
})
it("rejects missing, repeated, overlapping or unsupported pieces and headboards buried in linen", () => {
  const props = { at: [0, 0], size: [1, 2], floor: 0, bed, linen } satisfies Parameters<typeof getBedLinenParts>[0]
  for (const pieces of [
    [],
    [linen[0], linen[0]],
    [linen[0], { ...linen[1], id: linen[0].id }],
    [linen[0], { ...linen[1], fromHead: 0.2 }],
    [linen[0], { ...linen[1], width: 1 }],
    [linen[0], { ...linen[1], length: 2 }],
  ])
    expect(getBedLinenParts({ ...props, linen: pieces })).toBeInstanceOf(Error)
  expect(getBedLinenParts({ ...props, floor: NaN })).toBeInstanceOf(Error)
  expect(getBedLinenParts({ ...props, bed: { ...bed, headHeight: 0.55 } })).toEqual(new Error("Bed linen buries its headboard"))
})
it("scales complete pieces once and preserves individual linen identities and the original measurements", () => {
  const before = structuredClone(bed),
    scale = 1.5,
    scaled = scaleBed(bed, scale),
    baseParts = bedParts({ at: [0, 0], size: [1, 2], floor: 0, bed }),
    scaledParts = bedParts({ at: [0, 0], size: [scale, 2 * scale], floor: 0, bed: scaled })
  expect(scaled.linen?.map((piece) => piece.id)).toEqual(linen.map((piece) => piece.id))
  expect(scaled.linen).not.toBe(linen)
  for (const index of baseParts.keys())
    for (const coordinate of ["x0", "y0", "z0", "x1", "y1", "z1"] satisfies (keyof Omit<(typeof baseParts)[number], "kind">)[])
      expect(scaledParts[index][coordinate]).toBeCloseTo(baseParts[index][coordinate] * scale, 12)
  expect(bed).toEqual(before)
  for (const invalid of [0, -1, NaN, Infinity]) expect(() => scaleBed(bed, invalid)).toThrow("Invalid bed scale")
})
