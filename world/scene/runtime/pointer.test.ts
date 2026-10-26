import { afterEach, expect, it, vi } from "vitest"
import * as THREE from "three"
import { createPointer } from "./pointer"

vi.mock("../world", async (original) => ({ ...(await original<typeof import("../world")>()), walkH: () => 0, isFree: () => true }))
vi.mock("../actors", () => ({ critters: [] }))
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function fixture() {
  const window = new EventTarget()
  vi.stubGlobal("window", window)
  const canvas = Object.assign(new EventTarget(), { style: {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) })
  const spotHit = vi.fn<() => string | null>(() => null)
  const approachSpot = vi.fn()
  const camera = new THREE.PerspectiveCamera()
  const ray = vi.spyOn(THREE.Raycaster.prototype, "setFromCamera")
  const movement = { yawTarget: 0 }
  const pointer = createPointer({
    renderer: { domElement: canvas } as unknown as THREE.WebGLRenderer,
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
  const { pointer, send, ray, spotHit } = fixture()
  for (let x = 0; x < 100; x++) send("pointermove", x)
  expect(ray).not.toHaveBeenCalled()
  pointer.update()
  expect(ray).toHaveBeenCalledOnce()
  expect(ray.mock.calls[0][0].x).toBeCloseTo(0.98)
  expect(spotHit).toHaveBeenCalledOnce()
  pointer.update()
  expect(ray).toHaveBeenCalledOnce()
  pointer.dispose()
})

it("checks clicks immediately at the click position even when hover is pending", () => {
  const { pointer, send, ray, spotHit, approachSpot } = fixture()
  send("pointermove", 10)
  send("pointerdown", 80)
  spotHit.mockReturnValueOnce("ore")
  send("pointerup", 80)
  expect(ray).toHaveBeenCalledOnce()
  expect(ray.mock.calls[0][0].x).toBeCloseTo(0.6)
  expect(approachSpot).toHaveBeenCalledWith("ore")
  pointer.dispose()
})

it("discards queued hover when the pointer enters UI or the scene is disposed", () => {
  const { pointer, send, ray, window } = fixture()
  send("pointermove", 10)
  send("pointermove", 20, window)
  pointer.update()
  expect(ray).not.toHaveBeenCalled()
  send("pointermove", 30)
  pointer.dispose()
  pointer.update()
  send("pointermove", 40)
  pointer.update()
  expect(ray).not.toHaveBeenCalled()
})

it.each(["pointercancel", "blur"])("ends a drag on %s without turning or clicking after return", (type) => {
  const { pointer, send, ray, spotHit, approachSpot, movement } = fixture()
  spotHit.mockReturnValue("ore")
  send("pointerdown", 10)
  send("pointermove", 12)
  send(type, 12)
  pointer.update()
  expect(ray).not.toHaveBeenCalled()
  send("pointermove", 150)
  send("pointerup", 150)
  expect(movement.yawTarget).toBe(0)
  expect(approachSpot).not.toHaveBeenCalled()
  send("pointerdown", 50)
  send("pointerup", 50)
  expect(approachSpot).toHaveBeenCalledWith("ore")
  pointer.dispose()
})

it("keeps a drag owned by its original pointer when a second touch moves or ends", () => {
  const { pointer, send, movement, canvas } = fixture()
  send("pointerdown", 10, canvas, 1)
  send("pointerdown", 70, canvas, 2)
  send("pointermove", 300, canvas, 2)
  send("pointercancel", 300, canvas, 2)
  send("pointerup", 300, canvas, 2)
  expect(movement.yawTarget).toBe(0)
  send("pointermove", 110, canvas, 1)
  expect(Math.abs(movement.yawTarget)).toBe(Math.PI / 4)
  pointer.dispose()
})
