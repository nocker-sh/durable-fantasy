import { afterEach, expect, it, vi } from "vitest"
import * as THREE from "three"
import { createPointer } from "#/world/scene/runtime/pointer"

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function fixture() {
  const window = new EventTarget()
  vi.stubGlobal("window", window)
  const canvas = Object.assign(new EventTarget(), { style: { cursor: "default" }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) })
  const spotHit = vi.fn<() => string | null>(() => null)
  const approachSpot = vi.fn()
  const camera = new THREE.PerspectiveCamera()
  const ray = vi.spyOn(THREE.Raycaster.prototype, "setFromCamera")
  const movement = { yawTarget: 0 }
  const pointer = createPointer({
    renderer: { domElement: canvas },
    cam: camera,
    terrain: new THREE.Group(),
    town: new THREE.Group(),
    people: [],
    ids: [],
    remotes: new Map(),
    cursor: new THREE.LineSegments(),
    movement,
    spotHit,
    monsterHit: () => null,
    approach: vi.fn(),
    approachSpot,
    fight: vi.fn(),
    walkTo: vi.fn(),
    zoom: vi.fn(),
    clearFight: vi.fn(),
  })
  const send = (type: string, x: number, target: EventTarget = canvas, pointerId = 1) => {
    const event = new Event(type)
    Object.defineProperties(event, { target: { value: target }, clientX: { value: x }, clientY: { value: 50 }, button: { value: 0 }, pointerId: { value: pointerId } })
    ;(type === "pointerdown" ? canvas : window).dispatchEvent(event)
  }
  return { pointer, send, ray, spotHit, approachSpot, window, movement, canvas }
}

it("coalesces hover events to the most recent position once per rendered frame", () => {
  const f = fixture()
  for (const x of Array.from({ length: 100 }, (_, index) => index)) f.send("pointermove", x)
  expect(f.ray).not.toHaveBeenCalled()
  f.pointer.update()
  expect(f.ray).toHaveBeenCalledOnce()
  expect(f.ray.mock.calls[0][0].x).toBeCloseTo(0.98)
  expect(f.spotHit).toHaveBeenCalledOnce()
  f.pointer.update()
  expect(f.ray).toHaveBeenCalledOnce()
  f.pointer.dispose()
})

it("checks clicks immediately at the click position even when hover is pending", () => {
  const f = fixture()
  f.send("pointermove", 10)
  f.send("pointerdown", 80)
  f.spotHit.mockReturnValueOnce("ore")
  f.send("pointerup", 80)
  expect(f.ray).toHaveBeenCalledOnce()
  expect(f.ray.mock.calls[0][0].x).toBeCloseTo(0.6)
  expect(f.approachSpot).toHaveBeenCalledWith("ore")
  f.pointer.dispose()
})

it("discards queued hover when the pointer enters UI or the scene is disposed", () => {
  const f = fixture()
  f.send("pointermove", 10)
  f.send("pointermove", 20, f.window)
  f.pointer.update()
  expect(f.ray).not.toHaveBeenCalled()
  f.send("pointermove", 30)
  f.pointer.dispose()
  f.pointer.update()
  f.send("pointermove", 40)
  f.pointer.update()
  expect(f.ray).not.toHaveBeenCalled()
})

it.each(["pointercancel", "blur"])("ends a drag on %s without turning or clicking after return", (type) => {
  const f = fixture()
  f.spotHit.mockReturnValue("ore")
  f.send("pointerdown", 10)
  f.send("pointermove", 12)
  f.send(type, 12)
  f.pointer.update()
  expect(f.ray).not.toHaveBeenCalled()
  f.send("pointermove", 150)
  f.send("pointerup", 150)
  expect(f.movement.yawTarget).toBe(0)
  expect(f.approachSpot).not.toHaveBeenCalled()
  f.send("pointerdown", 50)
  f.send("pointerup", 50)
  expect(f.approachSpot).toHaveBeenCalledWith("ore")
  f.pointer.dispose()
})

it("keeps a drag owned by its original pointer when a second touch moves or ends", () => {
  const f = fixture()
  f.send("pointerdown", 10, f.canvas, 1)
  f.send("pointerdown", 70, f.canvas, 2)
  f.send("pointermove", 300, f.canvas, 2)
  f.send("pointercancel", 300, f.canvas, 2)
  f.send("pointerup", 300, f.canvas, 2)
  expect(f.movement.yawTarget).toBe(0)
  f.send("pointermove", 110, f.canvas, 1)
  expect(Math.abs(f.movement.yawTarget)).toBe(Math.PI / 4)
  f.pointer.dispose()
})
