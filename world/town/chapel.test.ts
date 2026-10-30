import { expect, it } from "vitest"
import { CHAPEL, chapelFootprints } from "./chapel"
it("preserves the existing exterior and entrance while sharing its definition", () => {
  expect(CHAPEL.body).toEqual({ x0: 8, x1: 15, z0: 3, z1: 7, height: 3.4 })
  expect([CHAPEL.body.x0 + CHAPEL.doorOffset, CHAPEL.body.z1 + CHAPEL.approachOffset]).toEqual([11.6, 7.8])
})
it("includes the west tower and the roof and buttresses in placement envelopes", () => {
  const [body, tower] = chapelFootprints()
  expect(body.rect).toEqual([7.75, 2.65, 15.25, 7.35])
  expect(tower.rect[0]).toBeLessThan(CHAPEL.tower.x0)
  expect(tower.rect[2]).toBeGreaterThan(CHAPEL.tower.x1)
  expect(tower.rect[0]).toBeLessThan(body.rect[0])
})
