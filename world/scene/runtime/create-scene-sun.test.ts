import { expect, it, vi } from "vitest"
import { WebGLRenderTarget } from "three"
import { createSceneSun } from "#/world/scene/runtime/create-scene-sun"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { N } from "#/world/scene/world"

it("preserves the sun's shadow camera and disposes both allocated shadow targets once", () => {
  const resources = new CleanupStack()
  const sun = createSceneSun(resources)
  expect(sun.color.getHex()).toBe(0xffe0b0)
  expect(sun.intensity).toBe(2.4)
  expect(sun.castShadow).toBe(true)
  expect(sun.shadow.mapSize.toArray()).toEqual([2048, 2048])
  expect(sun.shadow.camera).toMatchObject({ left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 120 })
  expect(sun.shadow.bias).toBe(-0.0008)
  expect(sun.target.position.toArray()).toEqual([N / 2, 0, N / 2])
  sun.shadow.map = new WebGLRenderTarget(1, 1)
  sun.shadow.mapPass = new WebGLRenderTarget(1, 1)
  const map = vi.spyOn(sun.shadow.map, "dispose")
  const pass = vi.spyOn(sun.shadow.mapPass, "dispose")
  resources.dispose()
  resources.dispose()
  expect(map).toHaveBeenCalledOnce()
  expect(pass).toHaveBeenCalledOnce()
})
