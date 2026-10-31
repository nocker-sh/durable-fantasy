import { expect, it } from "vitest"
import { deepStrictEqual } from "node:assert"
import { createGroundFields } from "#/world/maps/ground/create-ground-fields"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { F, layout, PLAZA_H, fieldsReady } from "#/world/scene/world"

it("generates independently of the selected scene and leaves all active buffers untouched", () => {
  const before = structuredClone(F),
    selected = layout.value,
    plaza = PLAZA_H.value,
    ready = fieldsReady.value
  const generated = createGroundFields({ ...SQUARE_LAYOUT, seed: SQUARE_LAYOUT.seed + 1 })
  expect(generated.h.some((height) => height !== 0)).toBe(true)
  deepStrictEqual(F, before)
  expect(layout.value).toBe(selected)
  expect(PLAZA_H.value).toBe(plaza)
  expect(fieldsReady.value).toBe(ready)
})
it("owns each generation's buffers and keeps alternating layouts deterministic", () => {
  const source = { ...SQUARE_LAYOUT, seed: 17 },
    before = JSON.stringify(source),
    first = createGroundFields(source),
    copy = structuredClone(first)
  const other = createGroundFields({ ...source, seed: 29 })
  other.h.fill(99)
  other.road.fill(99)
  other.river.fill(99)
  other.trail.fill(99)
  other.roadKind.fill(99)
  deepStrictEqual(first, copy)
  deepStrictEqual(createGroundFields(source), copy)
  expect(JSON.stringify(source)).toBe(before)
})
