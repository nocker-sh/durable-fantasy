import { storageBoxInterior } from "#/world/town/storage-box-interior"
import { expect, it } from "vitest"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import { scaleShelf } from "#/world/town/scale-shelf"
import type { ShelfSpec } from "#/world/town/shelf"
import { storageRetrieval } from "#/world/town/storage-retrieval"
const shelf: ShelfSpec = {
  height: 0.9,
  board: 0.025,
  levels: [0.12, 0.5, 0.9],
  front: "s",
  items: [
    {
      id: "box",
      kind: "box",
      board: 0,
      across: 0,
      fromBack: 0.04,
      width: 0.35,
      depth: 0.35,
      height: 0.25,
      wall: 0.015,
      lid: 0.02,
      retrieval: { withdraw: 0.45, bodyRadius: 0.4, bodyAcross: 0, bodyStart: 0.65, bodyEnd: 0.8, space: 0 },
    },
  ],
}
it("withdraws in every front direction and scales the same motion into room presentation units", () => {
  for (const front of ["n", "s", "w", "e"] as const) {
    const s = { ...shelf, front },
      sideways = front === "w" || front === "e",
      w = sideways ? 0.5 : 1,
      d = sideways ? 1 : 0.5,
      a = storageRetrieval({ x: 0, z: 0, width: w, depth: d, shelf: s, index: 0 }),
      b = storageRetrieval({ x: 0, z: 0, width: w * 1.5, depth: d * 1.5, shelf: scaleShelf(s, 1.5), index: 0 })
    expect(a.to.x0 - a.from.x0).toBeCloseTo(a.delta[0])
    expect(a.to.z0 - a.from.z0).toBeCloseTo(a.delta[1])
    for (const field of ["gripsStart", "gripsEnd"] as const) for (const hand of [0, 1]) for (const axis of [0, 1]) expect(b[field][hand][axis]).toBeCloseTo(a[field][hand][axis] * 1.5)
    for (const field of ["bodyStart", "bodyEnd", "delta"] as const) for (const axis of [0, 1]) expect(b[field][axis]).toBeCloseTo(a[field][axis] * 1.5)
  }
})
it("rejects solid boxes whose wall or lid leaves no usable interior", () => {
  const original = storageBoxInterior(shelf.items![0]),
    scaled = storageBoxInterior(scaleShelf(shelf, 1.5).items![0])
  expect(scaled.volume).toBeCloseTo(original.volume * 1.5 ** 3)
  expect(() => storageBoxInterior({ ...shelf.items![0], wall: 0.2 })).toThrow("Invalid storage box")
  expect(() => storageBoxInterior({ ...shelf.items![0], height: Infinity })).toThrow("Invalid storage box")
  expect(() => shelfItemParts({ x: 0, z: 0, width: 1, depth: 0.5, floor: 0, shelf: { ...shelf, items: [{ ...shelf.items![0], lid: 0.25 }] } })).toThrow("Invalid storage box")
})

it("does not treat a deep side opening as the same shallow shelf", () => {
  expect(() => storageRetrieval({ x: 0, z: 0, width: 1, depth: 0.5, shelf: { ...shelf, front: "e" }, index: 0 })).toThrow("does not clear")
})
