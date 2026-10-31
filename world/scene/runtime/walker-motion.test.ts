import { afterEach, expect, it, vi } from "vitest"
import { Vector3 } from "three"
import { WalkerMotion } from "#/world/scene/runtime/walker-motion"
import { ANIM_DUR } from "#/world/scene/figure/animation"
import type { MotionWalker } from "#/world/scene/runtime/walker-motion-types"
import type { V2 } from "#/world/scene/construction/registry"

afterEach(() => vi.restoreAllMocks())

function walker() {
  const pos: V2 = [0, 0]
  const path: V2[] = []
  return {
    pos,
    path,
    head: 0,
    t: 0,
    fig: {
      pose: vi.fn<MotionWalker["fig"]["pose"]>(),
      face: vi.fn<MotionWalker["fig"]["face"]>(),
      refresh: vi.fn<MotionWalker["fig"]["refresh"]>(),
      root: { position: new Vector3() },
    },
  }
}

it("uses actual elapsed time across waypoints and bounded delta only for pose progress", () => {
  const me = walker()
  const motion = new WalkerMotion({ me, speed: 2, heightAt: () => 0 })
  me.path = [
    [0, 0],
    [1, 0],
    [1, 2],
  ]
  expect(motion.step(me, 0.05, 1)).toBe(true)
  expect(me.pos).toEqual([1, 1])
  expect(me.path).toEqual([[1, 2]])
  expect(me.t).toBe(0.65)
  expect(me.fig.pose).toHaveBeenLastCalledWith("walk", 0.65)
})

it("reports the final moving frame before switching to idle on the next frame", () => {
  const me = walker()
  const motion = new WalkerMotion({ me, speed: 2, heightAt: () => 0 })
  me.path = [[1, 0]]
  expect(motion.step(me, 0.05, 1)).toBe(true)
  expect(me.path).toEqual([])
  expect(me.fig.pose).toHaveBeenLastCalledWith("walk", 0.65)
  expect(motion.step(me, 0.05)).toBe(false)
  expect(me.fig.pose.mock.calls.at(-1)?.[0]).toBe("idle")
})

it("plays only the local unexpired action and retains it after its strict expiry", () => {
  vi.spyOn(performance, "now").mockReturnValue(90)
  const me = walker()
  const other = walker()
  const motion = new WalkerMotion({ me, speed: 2, heightAt: () => 0 })
  motion.action = { anim: "sword", until: 100 }
  motion.step(me, 0.1)
  expect(me.fig.pose).toHaveBeenLastCalledWith("sword", (0.1 * Math.PI * 2) / ANIM_DUR.sword)
  motion.step(other, 0.1)
  expect(other.fig.pose.mock.calls.at(-1)?.[0]).toBe("idle")
  vi.mocked(performance.now).mockReturnValue(100)
  motion.step(me, 0.1)
  expect(me.fig.pose.mock.calls.at(-1)?.[0]).toBe("idle")
  expect(motion.action).toEqual({ anim: "sword", until: 100 })
})

it("defaults elapsed time to delta and turns along the movement heading", () => {
  const me = walker()
  const motion = new WalkerMotion({ me, speed: 2, heightAt: () => 0 })
  me.path = [[2, 0]]
  motion.step(me, 0.25)
  expect(me.pos).toEqual([0.5, 0])
  expect(me.head).toBe(Math.PI / 2)
})

it("caches height per walker and updates position, facing and sprite together", () => {
  const me = walker()
  const other = walker()
  const heightAt = vi.fn((x: number, z: number) => x + z + 3)
  const motion = new WalkerMotion({ me, speed: 2, heightAt })
  motion.place(me)
  motion.place(me)
  expect(heightAt).toHaveBeenCalledTimes(1)
  motion.place(other)
  expect(heightAt).toHaveBeenCalledTimes(2)
  me.pos = [1, 2]
  me.head = 0.7
  motion.place(me)
  expect(heightAt).toHaveBeenCalledTimes(3)
  expect(me.fig.root.position.toArray()).toEqual([1, 6, 2])
  expect(me.fig.face).toHaveBeenLastCalledWith(0.7)
  expect(me.fig.refresh).toHaveBeenCalledTimes(3)
})
