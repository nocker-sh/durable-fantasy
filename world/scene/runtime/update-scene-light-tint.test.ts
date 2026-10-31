import { afterEach, expect, it } from "vitest"
import { Color, DirectionalLight, SpriteMaterial } from "three"
import { updateSceneLightTint } from "#/world/scene/runtime/update-scene-light-tint"
import { SCENE_LIGHT_PALETTES } from "#/world/scene/runtime/scene-light-palettes"
import { litSprites } from "#/world/scene/gfx"
import { view } from "#/world/scene/actors"
import { N } from "#/world/scene/world"

const originalTint = view.tint.clone()
afterEach(() => {
  for (const material of litSprites) material.dispose()
  litSprites.length = 0
  view.tint.copy(originalTint)
})
it("tints unlit sprites, positions the sun and updates the existing water color without replacing its uniforms", () => {
  const sprite = new SpriteMaterial()
  litSprites.push(sprite)
  const color = sprite.color
  const sun = new DirectionalLight()
  const sky = new Color(0)
  const water = { sky: { value: sky }, t: { value: 99 } }
  const light = { ...SCENE_LIGHT_PALETTES[2], azimuth: 0, elevation: 0 }
  updateSceneLightTint({ light, sun, water })
  expect(view.tint).toEqual(new Color(light.tint))
  expect(sprite.color).toBe(color)
  expect(sprite.color).toEqual(view.tint)
  expect(sun.position.toArray()).toEqual([N / 2 + 30, 0, N / 2])
  expect(water.sky.value).toBe(sky)
  expect(sky).toEqual(new Color(light.sky).lerp(new Color(0xffffff), 0.35))
  expect(water.t.value).toBe(99)
})
