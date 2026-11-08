import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { Scene } from "three"
import { SceneLighting } from "#/world/scene/runtime/scene-lighting"
import { createSceneEnvironment } from "#/world/scene/runtime/create-scene-environment"
import { createSceneWater } from "#/world/scene/runtime/create-scene-water"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { updateSceneAmbientLight } from "#/world/scene/runtime/update-scene-ambient-light"
import { updateSceneLamps } from "#/world/scene/runtime/update-scene-lamps"
import { lamps } from "#/world/scene/construction/registry"
import { MeshLambertMaterial, PointLight } from "three"

const effects = vi.hoisted(() => {
  const events: string[] = []
  return { events }
})
vi.mock("#/world/scene/runtime/update-scene-ambient-light", () => ({ updateSceneAmbientLight: vi.fn(() => effects.events.push("ambient")) }))
vi.mock("#/world/scene/runtime/update-scene-light-tint", () => ({ updateSceneLightTint: vi.fn(() => effects.events.push("tint")) }))
vi.mock("#/world/scene/runtime/update-scene-flames", () => ({ updateSceneFlames: vi.fn(() => effects.events.push("flames")) }))
vi.mock("#/world/scene/runtime/update-scene-lamps", () => ({ updateSceneLamps: vi.fn(() => effects.events.push("lamps")) }))
vi.mock("#/world/scene/runtime/update-scene-smoke", () => ({ updateSceneSmoke: vi.fn(() => effects.events.push("smoke")) }))
vi.mock("#/world/scene/runtime/scene-house-lights", () => ({
  SceneHouseLights: class {
    update() {
      effects.events.push("houses")
    }
  },
}))
const resources: CleanupStack[] = []
beforeEach(() => {
  effects.events.length = 0
  vi.clearAllMocks()
})
afterEach(() => {
  for (const resource of resources) resource.dispose()
  resources.length = 0
  for (const lamp of lamps) lamp.glow.dispose()
  lamps.length = 0
})
function fixture() {
  const owned = new CleanupStack()
  resources.push(owned)
  const scene = new Scene()
  const environment = createSceneEnvironment(scene, owned)
  const wm = createSceneWater(owned).material
  const applySchedule = vi.fn(() => effects.events.push("schedule"))
  const lighting = new SceneLighting({ scene, environment, wm, world: { layout: SQUARE_LAYOUT, centre: [0, 0], build() {} }, applySchedule })
  return { lighting, applySchedule, wm }
}

it("initializes noon and normalizes clock updates before schedule, house lights and tint", () => {
  const f = fixture()
  expect(f.applySchedule).toHaveBeenCalledExactlyOnceWith(720)
  expect(effects.events).toEqual(["ambient", "schedule", "houses", "tint"])
  effects.events.length = 0
  f.lighting.setClock(-1)
  expect(f.lighting.minutes).toBe(1439)
  expect(f.applySchedule).toHaveBeenLastCalledWith(1439)
  expect(effects.events).toEqual(["ambient", "schedule", "houses", "tint"])
  f.lighting.setClock(2881)
  expect(f.lighting.minutes).toBe(1)
  expect(Object.isFrozen(f.lighting)).toBe(true)
})

it("cycles the three debug looks in both directions and retains fractional clock minutes", () => {
  const f = fixture()
  for (const index of [-1, 0, 1, 2, 3]) {
    f.lighting.setTod(index)
    expect(f.lighting.minutes).toBe([1320, 720, 1005, 1320, 720][index + 1])
  }
  f.lighting.setClock(-0.5)
  expect(f.lighting.minutes).toBe(1439.5)
})

it("snapshots the guard's lamp order at construction and updates flames, lamps, smoke, then water time", () => {
  for (const x of [9, 1]) lamps.push({ x, z: 0, light: new PointLight(), glow: new MeshLambertMaterial() })
  const f = fixture()
  effects.events.length = 0
  lamps.reverse()
  vi.mocked(updateSceneLamps).mockImplementation(() => {
    effects.events.push("lamps")
    expect(f.wm.uniforms.t.value).toBe(0)
  })
  f.lighting.animate(0.25, 12)
  expect(effects.events).toEqual(["flames", "lamps", "smoke"])
  expect(updateSceneLamps).toHaveBeenLastCalledWith([lamps[0], lamps[1]], 720, 12)
  expect(f.wm.uniforms.t.value).toBe(12)
})

it("does not advance schedules and later effects after an ambient update fails", () => {
  const f = fixture()
  const failure = Error("ambient failure")
  vi.mocked(updateSceneAmbientLight).mockImplementationOnce(() => {
    throw failure
  })
  effects.events.length = 0
  f.applySchedule.mockClear()
  expect(() => f.lighting.setClock(1290)).toThrow(failure)
  expect(f.applySchedule).not.toHaveBeenCalled()
  expect(effects.events).toEqual([])
})
