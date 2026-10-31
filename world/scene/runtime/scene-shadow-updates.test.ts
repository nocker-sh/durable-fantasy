import { expect, it } from "vitest"
import { SceneShadowUpdates } from "#/world/scene/runtime/scene-shadow-updates"

it("requests the first shadow frame and uses a strict interval from the last request", () => {
  const shadowMap = { needsUpdate: false }
  const shadows = new SceneShadowUpdates({ shadowMap })
  const update = shadows.update
  update(0)
  expect(shadowMap.needsUpdate).toBe(true)
  shadowMap.needsUpdate = false
  update(250)
  expect(shadowMap.needsUpdate).toBe(false)
  update(251)
  expect(shadowMap.needsUpdate).toBe(true)
  shadowMap.needsUpdate = false
  update(501)
  expect(shadowMap.needsUpdate).toBe(false)
  update(502)
  expect(shadowMap.needsUpdate).toBe(true)
})

it("defers clock invalidation until the next frame and restarts the normal interval there", () => {
  const shadowMap = { needsUpdate: false }
  const shadows = new SceneShadowUpdates({ shadowMap })
  shadows.update(1000)
  shadowMap.needsUpdate = false
  shadows.invalidate()
  shadows.invalidate()
  expect(shadowMap.needsUpdate).toBe(false)
  shadows.update(1001)
  expect(shadowMap.needsUpdate).toBe(true)
  shadowMap.needsUpdate = false
  shadows.update(1251)
  expect(shadowMap.needsUpdate).toBe(false)
  shadows.update(1252)
  expect(shadowMap.needsUpdate).toBe(true)
})
