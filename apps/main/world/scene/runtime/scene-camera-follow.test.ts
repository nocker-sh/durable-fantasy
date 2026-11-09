import { expect, it, vi } from "vitest"
import { Vector3 } from "three"
import { SceneCameraFollow } from "#/world/scene/runtime/scene-camera-follow"
import type { PixelCamera } from "#/lib/graphics/pixel-camera"
import type { V2 } from "#/world/scene/construction/registry"

function fixture() {
  const camera = { focus: new Vector3(2, 0, 3), height: 800, look: vi.fn(), update: vi.fn<PixelCamera["update"]>() }
  const pos: V2 = [4, 6]
  const me = { pos, fig: { root: { position: { y: 7 } } } }
  const movement = { yaw: 1, yawTarget: 2 }
  const heightAt = vi.fn(() => 9)
  return { camera, me, movement, heightAt }
}

it("follows the live player's rendered height and acknowledges a turn after updating", () => {
  const f = fixture()
  const follow = new SceneCameraFollow({ ...f, preview: null })
  const update = follow.update
  f.camera.update.mockImplementation((input) => {
    expect(input.meAt.toArray()).toEqual([4, 7.6, 6])
    expect(input.turned).toBe(true)
    expect(input.yaw).toBe(2)
    expect(input.dt).toBe(0.05)
    expect(f.movement.yaw).toBe(1)
  })
  update(0.05)
  expect(f.movement.yaw).toBe(2)
  expect(f.heightAt).not.toHaveBeenCalled()
  expect(f.camera.look).not.toHaveBeenCalled()
})

it("reads replacement positions on the next frame and does not repeat a completed turn", () => {
  const f = fixture()
  const follow = new SceneCameraFollow({ ...f, preview: null })
  follow.update(0.1)
  f.me.pos = [10, 12]
  f.me.fig.root.position.y = -2
  follow.update(0.2)
  const last = f.camera.update.mock.calls[1][0]
  expect(last.meAt.toArray()).toEqual([10, -1.4, 12])
  expect(last.turned).toBe(false)
  expect(last.dt).toBe(0.2)
})

it("applies preview input at the target yaw before sampling the new focus height", () => {
  const f = fixture()
  const events: string[] = []
  const preview = {
    update: vi.fn((dt: number, height: number) => {
      events.push("input")
      expect(f.movement.yaw).toBe(2)
      expect([dt, height]).toEqual([0.1, 800])
      f.camera.focus.set(11, -1, 13)
    }),
  }
  f.heightAt.mockImplementation(() => {
    events.push("height")
    return 9
  })
  f.camera.look.mockImplementation((at: Vector3, yaw: number) => {
    events.push("look")
    expect(at).toBe(f.camera.focus)
    expect(at.toArray()).toEqual([11, 9.6, 13])
    expect(yaw).toBe(2)
  })
  new SceneCameraFollow({ ...f, preview }).update(0.1)
  expect(events).toEqual(["input", "height", "look"])
  expect(f.heightAt).toHaveBeenCalledExactlyOnceWith(11, 13)
  expect(f.camera.update).not.toHaveBeenCalled()
})
