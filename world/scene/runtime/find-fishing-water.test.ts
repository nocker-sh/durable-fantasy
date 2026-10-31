import { expect, it, vi } from "vitest"
import { findFishingWater } from "#/world/scene/runtime/find-fishing-water"
import type { V2 } from "#/world/scene/construction/registry"

const bridge = { x0: 10, z0: 10, x1: 11, z1: 11 }

it("searches the nearer radius first and stops on its first water candidate", () => {
  const heightAt = vi.fn((x: number) => (x >= 1 ? -1 : 1))
  expect(findFishingWater({ at: [0, 0], bridge, heightAt, waterHeight: 0 })).toEqual([1, 0])
  expect(heightAt).toHaveBeenCalledTimes(9)
})

it("keeps the interaction position by identity when no water is found", () => {
  const at: V2 = [0, 0]
  const heightAt = vi.fn(() => 0)
  expect(findFishingWater({ at, bridge, heightAt, waterHeight: 0 })).toBe(at)
  expect(heightAt).toHaveBeenCalledTimes(32)
})

it("rejects candidates near the bridge before reading their height", () => {
  const heightAt = vi.fn(() => -1)
  const wet = findFishingWater({ at: [0, 0], bridge: { x0: 1.2, z0: -0.1, x1: 1.3, z1: 0.1 }, heightAt, waterHeight: 0 })
  expect(wet[0]).toBeCloseTo(Math.cos(Math.PI / 4) * 0.5)
  expect(wet[1]).toBeCloseTo(Math.sin(Math.PI / 4) * 0.5)
  expect(heightAt).toHaveBeenCalledTimes(1)
})
