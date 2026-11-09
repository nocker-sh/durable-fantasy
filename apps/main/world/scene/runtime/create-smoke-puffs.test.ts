import { expect, it } from "vitest"
import { Vector3 } from "three"
import { createSmokePuffs } from "#/world/scene/runtime/create-smoke-puffs"

it("has no puffs without chimneys", () => {
  expect(createSmokePuffs([])).toEqual([])
})

it("keeps chimney order, independent ages, staggered phases, and a shared live origin per chimney", () => {
  const origins = Object.freeze([new Vector3(1, 2, 3), new Vector3(4, 5, 6), new Vector3(7, 8, 9), new Vector3(10, 11, 12)])
  const puffs = createSmokePuffs(origins)
  expect(puffs).toHaveLength(28)
  expect(puffs.every((puff) => puff.life === 4.5)).toBe(true)
  for (const entry of origins.entries()) {
    const offset = entry[0] * 7
    expect(puffs.slice(offset, offset + 7).every((puff) => puff.origin === entry[1])).toBe(true)
    expect(puffs[offset].age).toBe(entry[0])
    expect(puffs[offset + 6].age).toBe((6 / 7) * 4.5 + entry[0])
  }
  expect([puffs[0].driftX, puffs[7].driftX, puffs[14].driftX, puffs[21].driftX]).toEqual([0.15, 0.2, 0.25, 0.15])
  puffs[0].age = 1
  expect(puffs[1].age).toBeCloseTo(4.5 / 7, 14)
  origins[0].x = 30
  expect(puffs[0].origin.x).toBe(30)
  expect(puffs[7].origin.x).toBe(4)
})
