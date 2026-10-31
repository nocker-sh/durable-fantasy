import { afterEach, expect, it, vi } from "vitest"
import { SceneFrameLoop } from "#/world/scene/runtime/scene-frame-loop"

afterEach(() => vi.unstubAllGlobals())
afterEach(() => vi.restoreAllMocks())

function fixture() {
  vi.spyOn(performance, "now").mockReturnValue(100)
  const callbacks: FrameRequestCallback[] = []
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => callbacks.push(callback)),
  )
  const state = { running: true }
  const clock = { getDelta: vi.fn(() => 0.1), elapsedTime: 3 }
  const render = vi.fn()
  const tick = vi.fn()
  const loop = new SceneFrameLoop({ clock, running: () => state.running, render, tick })
  const step = (at: number) => {
    const callback = callbacks.shift()
    if (!callback) throw Error("No scheduled frame")
    callback(at)
  }
  return { loop, clock, state, render, tick, callbacks, step }
}

it("flushes the clock on start and caps simulation delta while preserving actual elapsed time", () => {
  const f = fixture()
  f.loop.start()
  expect(f.clock.getDelta).toHaveBeenCalledOnce()
  expect(f.render).not.toHaveBeenCalled()
  f.step(0)
  expect(f.render).toHaveBeenCalledExactlyOnceWith({ at: 0, elapsed: 0.1, dt: 0.05, time: 3 })
  expect(f.callbacks).toHaveLength(1)
})

it("skips high-refresh frames without consuming the clock and resumes without replaying a stall", () => {
  const f = fixture()
  f.loop.start()
  f.step(0)
  f.step(8)
  expect(f.render).toHaveBeenCalledTimes(1)
  expect(f.clock.getDelta).toHaveBeenCalledTimes(2)
  f.step(1000)
  expect(f.render).toHaveBeenCalledTimes(2)
  expect(f.callbacks).toHaveLength(1)
})

it("stops scheduling when the runtime has stopped", () => {
  const f = fixture()
  f.loop.start()
  f.state.running = false
  f.step(0)
  expect(f.render).not.toHaveBeenCalled()
  expect(f.callbacks).toEqual([])
})

it("measures completed frames at the exact window boundary", () => {
  const f = fixture()
  f.loop.record(100)
  f.loop.record(1099)
  expect(f.loop.fps).toBe(0)
  f.loop.record(1100)
  expect(f.loop.fps).toBe(3)
  f.loop.record(2100)
  expect(f.loop.fps).toBe(1)
})

it("reports strictly after the interval and reserves its timestamp before callbacks", () => {
  const f = fixture()
  f.loop.record(200)
  expect(f.tick).not.toHaveBeenCalled()
  f.tick.mockImplementationOnce(() => f.loop.record(201))
  f.loop.record(201)
  expect(f.tick).toHaveBeenCalledOnce()
  f.loop.record(401)
  expect(f.tick).toHaveBeenCalledOnce()
  f.loop.record(402)
  expect(f.tick).toHaveBeenCalledTimes(2)
})

it("does not queue another frame when rendering stops the runtime", () => {
  const f = fixture()
  f.render.mockImplementation(() => {
    f.state.running = false
  })
  f.loop.start()
  f.step(0)
  expect(f.render).toHaveBeenCalledOnce()
  expect(f.callbacks).toEqual([])
})

it("does not queue another frame when a completed frame's tick stops the runtime", () => {
  const f = fixture()
  f.tick.mockImplementation(() => {
    f.state.running = false
  })
  f.render.mockImplementation(() => f.loop.record(201))
  f.loop.start()
  f.step(0)
  expect(f.tick).toHaveBeenCalledOnce()
  expect(f.callbacks).toEqual([])
})

it("keeps one scheduled frame when start is called repeatedly", () => {
  const request = fixture()
  request.loop.start()
  request.loop.start()
  request.loop.start()
  expect(request.callbacks).toHaveLength(1)
  expect(request.clock.getDelta).toHaveBeenCalledOnce()
  request.step(0)
  expect(request.render).toHaveBeenCalledOnce()
  expect(request.callbacks).toHaveLength(1)
})

it("does not create a second loop when render calls start again", () => {
  const request = fixture()
  request.render.mockImplementation(() => request.loop.start())
  request.loop.start()
  request.step(0)
  expect(request.callbacks).toHaveLength(1)
  expect(request.clock.getDelta).toHaveBeenCalledTimes(2)
})

it("can retry scheduling after the animation frame request throws", () => {
  const request = fixture()
  const failure = new Error("schedule failed")
  vi.mocked(requestAnimationFrame).mockImplementationOnce(() => {
    throw failure
  })
  expect(() => request.loop.start()).toThrow(failure)
  request.loop.start()
  expect(request.callbacks).toHaveLength(1)
  request.step(0)
  expect(request.render).toHaveBeenCalledOnce()
})

it("can start again after a stopped frame has consumed its reservation", () => {
  const request = fixture()
  request.loop.start()
  request.state.running = false
  request.step(0)
  expect(request.callbacks).toEqual([])
  request.state.running = true
  request.loop.start()
  request.step(1000)
  expect(request.render).toHaveBeenCalledOnce()
  expect(request.callbacks).toHaveLength(1)
})
