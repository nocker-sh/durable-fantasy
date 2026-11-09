import { expect, it } from "vitest"
import { mixSceneLight } from "#/world/scene/runtime/mix-scene-light"
import { getSceneLight } from "#/world/scene/runtime/get-scene-light"
import { SCENE_LIGHT_PALETTES } from "#/world/scene/runtime/scene-light-palettes"

it("mixes colors in linear space while interpolating numerical strengths and directions", () => {
  const dark = { ...SCENE_LIGHT_PALETTES[0], sun: 0, sunIntensity: 1, azimuth: 2 }
  const bright = { ...dark, sun: 0xffffff, sunIntensity: 3, azimuth: 4 }
  expect(mixSceneLight(dark, bright, 0)).toEqual(dark)
  expect(mixSceneLight(dark, bright, 1)).toEqual(bright)
  expect(mixSceneLight(dark, bright, 0.5)).toMatchObject({ sun: 0xbcbcbc, sunIntensity: 2, azimuth: 3 })
  expect(dark.sun).toBe(0)
})

it("reaches the day and night palettes and keeps the full day's blend finite", () => {
  expect(getSceneLight(720)).toEqual({ ...SCENE_LIGHT_PALETTES[0], azimuth: expect.closeTo(0.9, 14) })
  expect(getSceneLight(1320)).toEqual(SCENE_LIGHT_PALETTES[2])
  for (const cursor of Array.from({ length: 1440 }, (_, minute) => minute)) {
    const light = getSceneLight(cursor)
    expect(Object.values(light).every(Number.isFinite)).toBe(true)
    expect(light.night).toBeGreaterThanOrEqual(0)
    expect(light.night).toBeLessThanOrEqual(1)
  }
})
