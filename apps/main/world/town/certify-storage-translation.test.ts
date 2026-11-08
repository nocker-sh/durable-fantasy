import { expect, it } from "vitest"
import { certifyStorageTranslation } from "#/world/town/certify-storage-translation"
import { storageBoxParts } from "#/world/town/storage-box-parts"
const parts = storageBoxParts({
  bounds: { x0: 1, x1: 1.28, z0: 1, z1: 1.32, y0: 0.05, y1: 0.31 },
  wall: 0.0015,
  lid: 0.0015,
  lift: 0,
  handle: { axis: "z", span: 0.08, depth: 0.018, height: 0.04, thickness: 0.003 },
})
const section = { bounds: { x0: 0, x1: 3, z0: 0, z1: 3 }, ceiling: 2, obstacles: [{ x0: 1.13, x1: 1.15, z0: 1.15, z1: 1.17, bottom: 0.42, top: 0.43 }] }
it("rejects an obstruction between clear pickup and carry positions, including on the return", () => {
  expect(certifyStorageTranslation({ parts, from: [0, 0, 0], to: [0, 0, 0], section: section, name: "Storage box" })).toBeNull()
  expect(certifyStorageTranslation({ parts, from: [0, 0.6, 0], to: [0, 0.6, 0], section: section, name: "Storage box" })).toBeNull()
  expect(certifyStorageTranslation({ parts, from: [0, 0, 0], to: [0, 0.6, 0], section: section, name: "Storage box" })).toEqual(new Error("Storage box movement intersects an obstacle"))
  expect(certifyStorageTranslation({ parts, from: [0, 0.6, 0], to: [0, 0, 0], section: section, name: "Storage box" })).toEqual(new Error("Storage box movement intersects an obstacle"))
})
it("keeps the handle inside the room and rejects missing or nonfinite movement geometry", () => {
  const clear = { ...section, obstacles: [] }
  expect(certifyStorageTranslation({ parts, from: [0, 0, 0], to: [0, 1.7, 0], section: clear, name: "Storage box" })).toEqual(new Error("Storage box movement leaves its room section"))
  expect(certifyStorageTranslation({ parts, from: [0, 0, 0], to: [0, NaN, 0], section: clear, name: "Storage box" })).toEqual(new Error("Invalid storage box movement geometry"))
  expect(certifyStorageTranslation({ parts: [], from: [0, 0, 0], to: [0, 0.6, 0], section: clear, name: "Storage box" })).toEqual(new Error("Invalid storage box movement geometry"))
  expect(certifyStorageTranslation({ parts, from: [0, 0, 0], to: [0, 0.6, 0], section: { ...section, obstacles: [{ ...section.obstacles[0], top: NaN }] }, name: "Storage box" })).toEqual(
    new Error("Invalid storage box movement geometry"),
  )
})
