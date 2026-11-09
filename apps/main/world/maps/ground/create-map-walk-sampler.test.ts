import { expect, it } from "vitest"
import { createMapWalkSampler } from "#/world/maps/ground/create-map-walk-sampler"
import { getOutdoorWalkSurfaces } from "#/world/town/get-outdoor-walk-surfaces"
import { F, layout, fieldsReady } from "#/world/scene/world"
import { deepStrictEqual } from "node:assert"

it("reads maps independently without selecting a scene or changing its buffers", () => {
  const selected = layout.value,
    ready = fieldsReady.value,
    fields = structuredClone(F)
  const town = createMapWalkSampler("phanthiet"),
    before = town.sample(12, 20)
  createMapWalkSampler("red-dunes").sample(12, 20)
  expect(town.sample(12, 20)).toBe(before)
  expect(town.mapId).toBe("phanthiet")
  expect(Object.isFrozen(town)).toBe(true)
  expect(layout.value).toBe(selected)
  expect(fieldsReady.value).toBe(ready)
  deepStrictEqual(F, fields)
})
it("captures surfaces independently from later mutations of the source definition", () => {
  const sampler = createMapWalkSampler("phanthiet-market"),
    step = getOutdoorWalkSurfaces(sampler.mapId)[0]
  if (!step) throw new Error("Missing adopted entrance step")
  const x = (step.rect[0] + step.rect[2]) / 2,
    z = (step.rect[1] + step.rect[3]) / 2,
    before = sampler.sample(x, z),
    height = step.height
  try {
    Reflect.set(step, "height", height + 10)
    expect(sampler.sample(x, z)).toBe(before)
  } finally {
    Reflect.set(step, "height", height)
  }
})
it.each(["missing", "constructor", "toString", "__proto__", "unknown-in-room"])("rejects unregistered maps %s before layout fallback", (id) => {
  expect(() => createMapWalkSampler(id)).toThrow("map is missing or miskeyed")
})
