import { afterEach, expect, it, vi } from "vitest"
import * as THREE from "three"
import { ScenePointer } from "#/world/scene/runtime/scene-pointer"

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
  const monsterHit = vi.fn<() => string | null>(() => null)
  const fight = vi.fn()
  const walkTo = vi.fn()
  const zoom = vi.fn()
  const clearFight = vi.fn()
  const terrain = new THREE.Group()
  const cursor = new THREE.LineSegments()
  const canvasRemoved = vi.spyOn(canvas, "removeEventListener")
  const windowRemoved = vi.spyOn(window, "removeEventListener")
  const ray = vi.spyOn(THREE.Raycaster.prototype, "setFromCamera")
  const movement = { yawTarget: 0 }
  const pointer = new ScenePointer({
    renderer: { domElement: canvas },
    cam: camera,
    terrain,
    town: new THREE.Group(),
    people: [],
    ids: [],
    remotes: new Map(),
    cursor,
    movement,
    spotHit,
    monsterHit,
    approach: vi.fn(),
    approachSpot,
    fight,
    walkTo,
    zoom,
    clearFight,
  })
  const send = (type: string, x: number, options: { target?: EventTarget; pointerId?: number; pointerType?: string; buttons?: number; button?: number; deltaY?: number } = {}) => {
    const event = new Event(type, { cancelable: true })
    Object.defineProperties(event, {
      target: { value: options.target ?? canvas },
      clientX: { value: x },
      clientY: { value: 50 },
      button: { value: options.button ?? 0 },
      pointerId: { value: options.pointerId ?? 1 },
      pointerType: { value: options.pointerType ?? "" },
      buttons: { value: options.buttons ?? 1 },
      deltaY: { value: options.deltaY ?? 0 },
    })
    const host = type === "pointerdown" || type === "wheel" ? canvas : window
    host.dispatchEvent(event)
    return event
  }
  return { pointer, send, ray, spotHit, approachSpot, window, movement, canvas, monsterHit, fight, walkTo, zoom, clearFight, terrain, cursor, canvasRemoved, windowRemoved }
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
  f.send("pointermove", 20, { target: f.window })
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
  f.send("pointerdown", 10, { target: f.canvas, pointerId: 1 })
  f.send("pointerdown", 70, { target: f.canvas, pointerId: 2 })
  f.send("pointermove", 300, { target: f.canvas, pointerId: 2 })
  f.send("pointercancel", 300, { target: f.canvas, pointerId: 2 })
  f.send("pointerup", 300, { target: f.canvas, pointerId: 2 })
  expect(f.movement.yawTarget).toBe(0)
  f.send("pointermove", 110, { target: f.canvas, pointerId: 1 })
  expect(Math.abs(f.movement.yawTarget)).toBe(Math.PI / 4)
  f.pointer.dispose()
})

it.each([
  { distance: 6, canClick: true },
  { distance: 7, canClick: false },
])("treats a drag of $distance pixels as a click only when within tolerance", (input) => {
  const f = fixture()
  f.spotHit.mockReturnValue("ore")
  f.send("pointerdown", 10)
  f.send("pointermove", 10 + input.distance)
  f.send("pointerup", 10 + input.distance)
  expect(f.approachSpot).toHaveBeenCalledTimes(input.canClick ? 1 : 0)
  expect(f.movement.yawTarget).toBe(0)
  f.pointer.dispose()
})

it("turns at the exact drag threshold and starts the next step from the accepted position", () => {
  const f = fixture()
  f.send("pointerdown", 10)
  f.send("pointermove", 99)
  expect(f.movement.yawTarget).toBe(0)
  f.send("pointermove", 100)
  expect(Math.abs(f.movement.yawTarget)).toBe(Math.PI / 4)
  f.send("pointermove", 189)
  expect(Math.abs(f.movement.yawTarget)).toBe(Math.PI / 4)
  f.send("pointermove", 190)
  expect(Math.abs(f.movement.yawTarget)).toBe(Math.PI / 2)
  f.pointer.dispose()
})

it("cancels a lost mouse drag without turning or clicking on release", () => {
  const f = fixture()
  f.spotHit.mockReturnValue("ore")
  f.send("pointerdown", 10)
  f.send("pointermove", 150, { pointerType: "mouse", buttons: 0 })
  f.send("pointerup", 150)
  expect(f.movement.yawTarget).toBe(0)
  expect(f.approachSpot).not.toHaveBeenCalled()
  f.pointer.dispose()
})

it("prioritizes resources over creatures on a click and does not clear the fight", () => {
  const f = fixture()
  f.spotHit.mockReturnValue("ore")
  f.monsterHit.mockReturnValue("creature")
  f.send("pointerdown", 50)
  f.send("pointerup", 50)
  expect(f.approachSpot).toHaveBeenCalledExactlyOnceWith("ore")
  expect(f.monsterHit).not.toHaveBeenCalled()
  expect(f.fight).not.toHaveBeenCalled()
  expect(f.clearFight).not.toHaveBeenCalled()
  f.pointer.dispose()
})

it("selects a creature immediately when no resource is clicked", () => {
  const f = fixture()
  f.monsterHit.mockReturnValue("creature")
  f.send("pointerdown", 50)
  f.send("pointerup", 50)
  expect(f.fight).toHaveBeenCalledExactlyOnceWith("creature")
  expect(f.clearFight).not.toHaveBeenCalled()
  f.pointer.dispose()
})

it("clears fighting before walking to the clicked ground", () => {
  const f = fixture()
  const ground = vi.spyOn(THREE.Raycaster.prototype, "intersectObject").mockReturnValue([{ distance: 1, point: new THREE.Vector3(2.25, 0, 3.25), object: f.terrain }])
  f.send("pointerdown", 50)
  f.send("pointerup", 50)
  expect(f.walkTo).toHaveBeenCalledExactlyOnceWith([2.25, 3.25])
  expect(f.clearFight.mock.invocationCallOrder[0]).toBeLessThan(ground.mock.invocationCallOrder[0])
  f.pointer.dispose()
})

it("prevents wheel scrolling even during the exact zoom throttle interval", () => {
  const f = fixture()
  const now = vi.spyOn(performance, "now").mockReturnValue(1000)
  expect(f.send("wheel", 50, { deltaY: 1 }).defaultPrevented).toBe(true)
  now.mockReturnValue(1179)
  expect(f.send("wheel", 50, { deltaY: -1 }).defaultPrevented).toBe(true)
  expect(f.zoom.mock.calls).toEqual([[-1]])
  now.mockReturnValue(1180)
  f.send("wheel", 50, { deltaY: -1 })
  expect(f.zoom.mock.calls).toEqual([[-1], [1]])
  f.pointer.dispose()
})

it("releases every native listener once and ignores input after disposal", () => {
  const f = fixture()
  f.pointer.dispose()
  f.pointer.dispose()
  expect(f.canvasRemoved).toHaveBeenCalledTimes(2)
  expect(f.windowRemoved).toHaveBeenCalledTimes(4)
  f.send("pointerdown", 10)
  f.send("pointermove", 150)
  f.send("pointerup", 150)
  f.send("wheel", 50, { deltaY: 1 })
  const update = f.pointer.update
  update()
  expect(f.ray).not.toHaveBeenCalled()
  expect(f.zoom).not.toHaveBeenCalled()
  expect(f.canvas.style.cursor).toBe("default")
  expect(f.cursor.visible).toBe(false)
})
