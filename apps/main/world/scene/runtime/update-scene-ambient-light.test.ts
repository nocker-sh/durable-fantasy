import { afterEach, expect, it } from "vitest"
import { Color, DirectionalLight, HemisphereLight, MeshLambertMaterial, Scene } from "three"
import { updateSceneAmbientLight } from "#/world/scene/runtime/update-scene-ambient-light"
import { SCENE_LIGHT_PALETTES } from "#/world/scene/runtime/scene-light-palettes"
import { glowMats } from "#/world/scene/construction/registry"
import { SQUARE_LAYOUT } from "#/world/maps/layout"

const environment = { sun: new DirectionalLight(), hemi: new HemisphereLight() }
afterEach(() => {
  glowMats.length = 0
})

it("keeps the outdoor palette and replaces roofed sunlight and window glow without changing the palette", () => {
  const light = SCENE_LIGHT_PALETTES[0]
  const material = new MeshLambertMaterial()
  glowMats.push(material)
  const world = { layout: SQUARE_LAYOUT, centre: [0, 0] satisfies [number, number], build() {} }
  const scene = new Scene()
  updateSceneAmbientLight({ scene, world, environment, light, daylight: 1 })
  expect(environment.sun.color).toEqual(new Color(light.sun))
  expect(environment.sun.intensity).toBe(light.sunIntensity)
  expect(environment.hemi.intensity).toBe(light.hemisphereIntensity)
  expect(material.emissiveIntensity).toBe(light.glow)
  updateSceneAmbientLight({ scene, world: { ...world, indoor: true }, environment, light, daylight: 1 })
  expect(environment.sun.color).toEqual(new Color(0xffe8c8))
  expect(environment.sun.intensity).toBe(light.sunIntensity * 0.25)
  expect(environment.hemi.color).toEqual(new Color(0xffe2c0))
  expect(environment.hemi.groundColor).toEqual(new Color(0x3a2c28))
  expect(environment.hemi.intensity).toBe(0.75 + light.hemisphereIntensity * 0.15)
  expect(material.emissiveIntensity).toBe(1.05)
  expect(light.sun).toBe(0xfff2d8)
  material.dispose()
})
