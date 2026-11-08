import { expect, it } from "vitest"
import { getStorageBoxPackingError } from "#/world/town/get-storage-box-packing-error"
import { storageBoxParts } from "#/world/town/storage-box-parts"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
const box = { width: 1, depth: 0.5, height: 0.48, wall: 0.025, lid: 0.025 }
const clothes: LayoutBox = { id: "clothes", origin: [0.015, 0, 0.015], size: [0.4, 0.16, 0.4] }

it("packs against the cavity bounded by the actual bottom, walls and closed lid", () => {
  const parts = storageBoxParts({ bounds: { x0: 0, y0: 0, z0: 0, x1: 1, y1: 0.48, z1: 0.5 }, wall: box.wall, lid: box.lid })
  const inside = { ...clothes, origin: [0, 0, 0], size: [0.95, 0.43, 0.45] } satisfies LayoutBox
  expect(parts.find((piece) => piece.part === "bottom")?.y1).toBe(box.wall)
  expect(parts.find((piece) => piece.part === "lid")?.y0).toBeCloseTo(box.height - box.lid)
  expect(getStorageBoxPackingError({ box, contents: [inside], clearance: 0.015 })).toBeNull()
  for (const size of [
    [0.96, 0.43, 0.45],
    [0.95, 0.44, 0.45],
    [0.95, 0.43, 0.46],
  ]) {
    const oversized = { ...inside, size: [size[0], size[1], size[2]] } satisfies LayoutBox
    expect(getStorageBoxPackingError({ box, contents: [oversized], clearance: 0.015 })?.message).toContain("leaves its container")
  }
})

it("rejects touching parcels, floating contents and duplicate identities", () => {
  const second: LayoutBox = { id: "scarf", origin: [0.415, 0, 0.015], size: [0.24, 0.05, 0.18] }
  expect(getStorageBoxPackingError({ box, contents: [clothes, second], clearance: 0.015 })?.message).toContain("clearance")
  expect(getStorageBoxPackingError({ box, contents: [{ ...clothes, origin: [0.015, 0.01, 0.015] }], clearance: 0.015 })?.message).toContain("floor support")
  expect(getStorageBoxPackingError({ box, contents: [clothes, clothes], clearance: 0.015 })?.message).toContain("Duplicate")
  for (const wall of [0, -1, NaN, Infinity, 0.3]) expect(getStorageBoxPackingError({ box: { ...box, wall }, contents: [clothes], clearance: 0.015 })).toBeInstanceOf(Error)
})
