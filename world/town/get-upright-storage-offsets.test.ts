import { expect, it } from "vitest"
import { getUprightStorageOffsets } from "#/world/town/get-upright-storage-offsets"
it("lifts and lowers at the carrier positions without moving a floor-supported box sideways", () => {
  const offsets = getUprightStorageOffsets({
    bodyStart: [4.6, 6.03],
    poses: [
      [4.6, 6.03],
      [3.3, 6.03],
      [3.3, 3],
      [4.455, 3],
      [4.455, 2.28],
    ],
    height: 0.65,
  })
  if (offsets instanceof Error) throw offsets
  expect(offsets[0]).toEqual([0, 0, 0])
  expect(offsets[1]).toEqual([0, 0.65, 0])
  const landing = offsets[offsets.length - 1],
    beforeLanding = offsets[offsets.length - 2]
  expect(landing[0]).toBeCloseTo(4.455 - 4.6, 12)
  expect(landing[2]).toBeCloseTo(2.28 - 6.03, 12)
  expect(landing[1]).toBe(0)
  expect(beforeLanding).toEqual([landing[0], 0.65, landing[2]])
})
it("rejects a disconnected pickup and an invalid carry height", () => {
  expect(
    getUprightStorageOffsets({
      bodyStart: [0, 0],
      poses: [
        [0.1, 0],
        [1, 0],
      ],
      height: 0.65,
    }),
  ).toEqual(new Error("Upright storage approach does not join its pickup"))
  expect(
    getUprightStorageOffsets({
      bodyStart: [0, 0],
      poses: [
        [0, 0],
        [1, 0],
      ],
      height: NaN,
    }),
  ).toEqual(new Error("Invalid upright storage approach"))
})
