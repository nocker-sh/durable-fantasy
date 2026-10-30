import { expect, it } from "vitest"
import { createMonsterNavigationFree } from "#/world/core/create-monster-navigation-free"

it("keeps the caller's point predicate when no body footprint is requested", () => {
  const free = (x: number, z: number) => x > 0 && z > 0
  expect(createMonsterNavigationFree({ area: [0, 0, 3, 3], radius: 0, free })).toBe(free)
})
it("reads changed neighboring terrain on each query instead of caching a footprint's answer", () => {
  const terrain = { blocked: false }
  const free = (x: number, z: number) => !(terrain.blocked && Math.floor(x * 2) === 2 && Math.floor(z * 2) === 1)
  const navigationFree = createMonsterNavigationFree({ area: [0, 0, 3, 3], radius: 0.3, free })
  expect(navigationFree(0.9, 0.75)).toBe(true)
  terrain.blocked = true
  expect(free(0.9, 0.75)).toBe(true)
  expect(navigationFree(0.9, 0.75)).toBe(false)
  terrain.blocked = false
  expect(navigationFree(0.9, 0.75)).toBe(true)
})
