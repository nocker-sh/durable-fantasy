import { afterEach, expect, it, vi } from "vitest"
import { Frustum, Object3D, PerspectiveCamera, Vector3 } from "three"
import { SceneWorldAnimation } from "#/world/scene/runtime/scene-world-animation"
import { view } from "#/world/scene/actors"
import { critters } from "#/world/scene/critters"
import { updaters } from "#/world/scene/construction/registry"
import { tickSprites } from "#/world/scene/tick-sprites"

vi.mock("#/world/scene/tick-sprites", () => ({ tickSprites: vi.fn() }))
afterEach(() => {
  critters.length = 0
  updaters.length = 0
  vi.clearAllMocks()
})

function fixture() {
  const camera = new PerspectiveCamera(32, 1, 0.5, 200)
  camera.position.set(2, 3, 4)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()
  const movement = { yaw: 0.7 }
  const people = [{ update: vi.fn() }]
  const animate = vi.fn()
  return { camera, movement, people, animate, animation: new SceneWorldAnimation({ camera, movement, people, animate }) }
}

it("publishes the pre-follow view and updates residents, animals, objects and lighting in order", () => {
  const f = fixture()
  const events: string[] = []
  vi.mocked(tickSprites).mockImplementation(() => {
    events.push("sprites")
  })
  f.people[0].update.mockImplementation((dt: number, time: number, say: () => void) => {
    events.push("resident")
    expect([dt, time]).toEqual([0.1, 7])
    expect(say()).toBeUndefined()
    expect(view.yaw).toBe(0.7)
    expect(view.cam.toArray()).toEqual([2, 3, 4])
    const expected = new Frustum().setFromProjectionMatrix(f.camera.projectionMatrix.clone().multiply(f.camera.matrixWorldInverse))
    expect(view.frustum).toEqual(expected)
  })
  const direction = f.camera.getWorldDirection(new Vector3())
  const right = new Vector3(-direction.z, 0, direction.x).normalize()
  critters.push({
    obj: new Object3D(),
    outline() {},
    update(dt, across) {
      events.push("animal")
      expect(dt).toBe(0.1)
      expect(across.toArray()).toEqual(right.toArray())
    },
  })
  updaters.push((time, dt) => {
    events.push("object")
    expect([time, dt]).toEqual([7, 0.1])
  })
  f.animate.mockImplementation((dt: number, time: number) => {
    events.push("light")
    expect([dt, time]).toEqual([0.1, 7])
  })
  f.animation.update({ at: 20, elapsed: 0.9, dt: 0.1, time: 7 })
  expect(events).toEqual(["sprites", "resident", "animal", "object", "light"])
})

it("reads the live camera, yaw and scene registries on subsequent frames", () => {
  const f = fixture()
  f.animation.update({ at: 10, elapsed: 0.1, dt: 0.1, time: 1 })
  const update = vi.fn()
  critters.push({ obj: new Object3D(), outline() {}, update })
  const object = vi.fn()
  updaters.push(object)
  f.camera.position.set(-2, 10, 12)
  f.camera.lookAt(1, 0, 2)
  f.camera.updateMatrixWorld()
  f.movement.yaw = -1
  f.animation.update({ at: 20, elapsed: 0.2, dt: 0.2, time: 2 })
  expect(view.cam.toArray()).toEqual([-2, 10, 12])
  expect(view.yaw).toBe(-1)
  expect(update).toHaveBeenCalledOnce()
  expect(object).toHaveBeenCalledExactlyOnceWith(2, 0.2)
  expect(tickSprites).toHaveBeenCalledTimes(2)
})

it("defers newly registered object updates to the next frame", () => {
  const f = fixture()
  const added = vi.fn()
  updaters.push(() => {
    updaters.push(added)
  })
  f.animation.update({ at: 10, elapsed: 0.1, dt: 0.1, time: 1 })
  expect(added).not.toHaveBeenCalled()
  f.animation.update({ at: 20, elapsed: 0.1, dt: 0.1, time: 2 })
  expect(added).toHaveBeenCalledExactlyOnceWith(2, 0.1)
})
