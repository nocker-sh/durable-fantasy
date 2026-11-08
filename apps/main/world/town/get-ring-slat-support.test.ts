import { expect, it } from "vitest"
import { getRingSlatSupport } from "#/world/town/get-ring-slat-support"

const bowl = { centerX: 0.11, centerZ: 0.11, radius: 0.08, margin: 0.01, depth: 0.42, centers: [0.0325, 0.0525, 0.0725, 0.0925, 0.1125, 0.1325, 0.1525, 0.1725] }
it("encloses the bowl's projected center inside four actual ring contacts", () => {
  const support = getRingSlatSupport(bowl)
  if (support instanceof Error) throw support

  expect(support.contacts).toHaveLength(4)
  for (const contact of support.contacts) expect(Math.hypot(contact[0] - bowl.centerX, contact[1] - bowl.centerZ)).toBeCloseTo(bowl.radius, 12)
  expect(support.supportRect.x0).toBeLessThanOrEqual(bowl.centerX - bowl.margin)
  expect(support.supportRect.x1).toBeGreaterThanOrEqual(bowl.centerX + bowl.margin)
  expect(support.supportRect.z0).toBeLessThanOrEqual(bowl.centerZ - bowl.margin)
  expect(support.supportRect.z1).toBeGreaterThanOrEqual(bowl.centerZ + bowl.margin)
})
it.each([{ centers: [0.12, 0.14] }, { centers: [0.1, 0.11] }, { centers: [0.03, 0.19] }, { centers: [0.2] }, { margin: 0.08 }, { margin: NaN }, { depth: 0.01 }])(
  "rejects one-sided, tangent or unsupported contact: %j",
  (change) => {
    expect(getRingSlatSupport({ ...bowl, ...change })).toBeInstanceOf(Error)
  },
)
