import { expect, it } from "vitest"
import { getBoxSideGrips } from "#/world/town/get-box-side-grips"
import { storageBoxParts } from "#/world/town/storage-box-parts"
import { pointRectDistance } from "#/lib/engine/point-rect-distance"
const parts = storageBoxParts({ bounds: { x0: 1, x1: 1.4, z0: 2, z1: 2.3, y0: 0, y1: 0.25 }, wall: 0.01, lid: 0.01 }).filter((part) => part.part !== "lid")
it("places both palm anchors outside the actual side faces for every facing", () => {
  const turns: ReadonlyArray<0 | 1 | 2 | 3> = [0, 1, 2, 3]
  for (const turn of turns) {
    const grips = getBoxSideGrips({ parts, height: 0.8, turn, palmRadius: 0.06 })
    if (grips instanceof Error) throw grips
    for (const grip of [grips.l, grips.r]) {
      expect(pointRectDistance(grip[0], grip[2], [1, 2, 1.4, 2.3])).toBeCloseTo(0.06, 12)
      expect(grip[1]).toBeCloseTo(1.04, 12)
    }
    if (turn === 0) expect([grips.l[2], grips.r[2]]).toEqual([2, 2])
    if (turn === 1) expect([grips.l[0], grips.r[0]]).toEqual([1.4, 1.4])
    if (turn === 2) expect([grips.l[2], grips.r[2]]).toEqual([2.3, 2.3])
    if (turn === 3) expect([grips.l[0], grips.r[0]]).toEqual([1, 1])
  }
})
it("rejects a missing or invalid palm size", () => {
  for (const palmRadius of [0, NaN, -0.1]) expect(getBoxSideGrips({ parts, height: 0.8, turn: 0, palmRadius })).toBeInstanceOf(Error)
})
