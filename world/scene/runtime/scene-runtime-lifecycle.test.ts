import { expect, it, vi } from "vitest"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { SceneFrameLoop } from "#/world/scene/runtime/scene-frame-loop"
import { SceneRuntimeLifecycle } from "#/world/scene/runtime/scene-runtime-lifecycle"
import type { SceneEvents } from "#/world/scene/runtime/types"

function events(): SceneEvents {
  return { progress: vi.fn(), ready: vi.fn(), walk: vi.fn(), reach: vi.fn(), gatherAt: vi.fn(), stationAt: vi.fn(), swing: vi.fn(), tick: vi.fn() }
}

it("keeps live connections until disposal and prevents any later reconnection", () => {
  const lifecycle = new SceneRuntimeLifecycle()
  const first = events()
  const second = events()
  expect(lifecycle.running).toBe(false)
  expect(lifecycle.events).toBeNull()
  lifecycle.running = true
  lifecycle.events = first
  expect(lifecycle.events).toBe(first)
  lifecycle.events = second
  expect(lifecycle.events).toBe(second)
  lifecycle.running = false
  lifecycle.running = true
  lifecycle.dispose()
  expect(lifecycle.running).toBe(false)
  expect(lifecycle.events).toBeNull()
  lifecycle.running = true
  lifecycle.events = first
  lifecycle.dispose()
  expect(lifecycle.running).toBe(false)
  expect(lifecycle.events).toBeNull()
  expect(Object.isFrozen(lifecycle)).toBe(true)
})

it("disconnects before another resource fails during cleanup", () => {
  const resources = new CleanupStack()
  const lifecycle = resources.use(new SceneRuntimeLifecycle())
  lifecycle.running = true
  lifecycle.events = events()
  const release = vi.fn(() => {
    expect(lifecycle.running).toBe(false)
    expect(lifecycle.events).toBeNull()
    throw new Error("resource failed")
  })
  resources.use({ dispose: release })
  resources.release(lifecycle)
  expect(() => resources.dispose()).toThrow(AggregateError)
  expect(release).toHaveBeenCalledOnce()
  expect(lifecycle.running).toBe(false)
})

it("stops an already queued frame after disposal without rendering or notifying", () => {
  const callbacks: FrameRequestCallback[] = []
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => callbacks.push(callback))
  try {
    const lifecycle = new SceneRuntimeLifecycle()
    const notifications = events()
    lifecycle.events = notifications
    lifecycle.running = true
    const render = vi.fn()
    const loop = new SceneFrameLoop({ clock: { getDelta: () => 0.01, elapsedTime: 1 }, running: () => lifecycle.running, render, tick: () => lifecycle.events?.tick() })
    loop.start()
    lifecycle.dispose()
    const frame = callbacks.shift()
    if (!frame) throw new Error("Frame was not scheduled")
    frame(1000)
    expect(render).not.toHaveBeenCalled()
    expect(notifications.tick).not.toHaveBeenCalled()
    expect(callbacks).toEqual([])
  } finally {
    vi.unstubAllGlobals()
  }
})
