import { expect, it } from "vitest"
import { getBackstepOffsets } from "#/world/town/get-backstep-offsets"
it.each(["l", "r"] satisfies ("l" | "r")[])("keeps a support foot while the %s foot leads, with no ground penetration", (leading) => {
  const trailing = leading === "l" ? "r" : "l",
    clearance = { l: 0, r: 0 }
  clearance[leading] = 0.0045
  for (const phase of Array.from({ length: 101 }, (_, index) => index / 100)) {
    const offsets = getBackstepOffsets({ phase, stride: 0.1, lift: 0.03, pelvisDrop: 0.004, settlingDrop: 0.003, leading, clearance })
    if (offsets instanceof Error) throw offsets
    if (phase <= 0.5) {
      expect(offsets[trailing][2] + offsets.body).toBeCloseTo(0, 12)
      expect(offsets[trailing][1]).toBe(0)
    }
    if (phase >= 0.5) {
      expect(offsets[leading][2] + offsets.body).toBeCloseTo(-0.1, 12)
      expect(offsets[leading][1] + clearance[leading]).toBeCloseTo(0, 12)
    }
    for (const hand of ["l", "r"] satisfies ("l" | "r")[]) expect(clearance[hand] + offsets[hand][1]).toBeGreaterThanOrEqual(0)
  }
})
it("preserves exact rest endpoints and refuses absent support or invalid dimensions", () => {
  const props: Parameters<typeof getBackstepOffsets>[0] = { phase: 0, stride: 0.1, lift: 0.03, pelvisDrop: 0.004, settlingDrop: 0.003, leading: "l" satisfies "l", clearance: { l: 0.0045, r: 0 } }
  const start = getBackstepOffsets(props),
    end = getBackstepOffsets({ ...props, phase: 1 })
  if (start instanceof Error) throw start
  if (end instanceof Error) throw end
  expect(start).toEqual({ body: -0, pelvisDrop: 0, l: [0, 0, 0], r: [0, 0, 0] })
  expect(end).toEqual({ body: -0.1, pelvisDrop: 0.003, l: [0, -0.0045, 0], r: [0, 0, 0] })
  expect(getBackstepOffsets({ ...props, leading: "r" })).toEqual(new Error("Backward step has no initially planted support foot"))
  for (const phase of [-1, 2, NaN]) expect(getBackstepOffsets({ ...props, phase })).toBeInstanceOf(Error)
  expect(getBackstepOffsets({ ...props, stride: 0 })).toBeInstanceOf(Error)
  expect(getBackstepOffsets({ ...props, lift: Infinity })).toBeInstanceOf(Error)
  expect(getBackstepOffsets({ ...props, settlingDrop: -0.01 })).toBeInstanceOf(Error)
})
