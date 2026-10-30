import { expect, it } from "vitest"
import { getCoveredTextileBox } from "#/world/town/get-covered-textile-box"
import { getStorageBoxContentBounds } from "#/world/town/get-storage-box-content-bounds"
import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
const fixture = () => ({ size: [0.32, 0.08, 0.21], packageSize: [0.28, 0.04, 0.19], wall: 0.005, lid: 0.005, clearance: 0.005 }) satisfies Parameters<typeof getCoveredTextileBox>[0]

it("builds bottom, four walls and a separate lid around the unchanged textile envelope", () => {
  const source = fixture(),
    before = JSON.stringify(source),
    box = getCoveredTextileBox(source)
  if (box instanceof Error) throw box
  expect(box.inside.width).toBeCloseTo(0.31, 14)
  expect(box.inside.height).toBeCloseTo(0.07, 14)
  expect(box.inside.depth).toBeCloseTo(0.2, 14)
  expect(box.parts.map((part) => part.part)).toEqual(["bottom", "side", "side", "side", "side", "lid"])
  const content = getStorageBoxContentBounds({ box: box.bounds, wall: source.wall, contents: [box.content] })[0]
  for (const part of box.parts)
    expect(cuboidTranslationHits({ relative: content, from: [0, 0, 0], to: [0, 0, 0], obstacle: { x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 } })).toBe(false)
  expect(box.content.size).toEqual(source.packageSize)
  expect(JSON.stringify(source)).toBe(before)
})

it("refuses lost wall space, insufficient gaps and a lid that consumes the contents space", () => {
  const source = fixture()
  expect(getCoveredTextileBox({ ...source, size: [0.32, 0.08, 0.209] })).toBeInstanceOf(Error)
  expect(getCoveredTextileBox({ ...source, wall: 0.02 })).toBeInstanceOf(Error)
  expect(getCoveredTextileBox({ ...source, lid: 0.05 })).toBeInstanceOf(Error)
  for (const invalid of [0, -1, NaN, Infinity]) {
    expect(getCoveredTextileBox({ ...source, packageSize: [0.28, invalid, 0.19] })).toBeInstanceOf(Error)
    expect(getCoveredTextileBox({ ...source, clearance: invalid })).toBeInstanceOf(Error)
  }
})
