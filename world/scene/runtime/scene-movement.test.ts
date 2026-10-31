import { afterEach, expect, it, vi } from "vitest"
import { Vector3 } from "three"
import { SceneMovement } from "#/world/scene/runtime/scene-movement"
import { PendingAction } from "#/world/scene/runtime/action-target"
import type { Walker } from "#/world/scene/runtime/walker"
import type { findPath } from "#/world/scene/path"
import type { isFree } from "#/world/scene/is-free"
import type { walkH } from "#/world/scene/walk-h"
import type { Cell } from "#/world/scene/runtime/types"

const calls = vi.hoisted(() => ({ path: vi.fn<typeof findPath>(), free: vi.fn<typeof isFree>(), height: vi.fn<typeof walkH>() }))
vi.mock("#/world/scene/path", () => ({ findPath: calls.path }))
vi.mock("#/world/scene/is-free", () => ({ isFree: calls.free }))
vi.mock("#/world/scene/walk-h", () => ({ walkH: calls.height }))
afterEach(() => vi.resetAllMocks())

function fixture() {
  const me: Pick<Walker, "path" | "pos"> = { pos: [0.25, 0.25], path: [] }
  const action = new PendingAction<string>()
  const marker = { visible: true, position: new Vector3() }
  const focus = new Vector3(10, 20, 30)
  const movement = { yaw: 0 }
  const onWalk = vi.fn<(path: Cell[]) => void>()
  calls.path.mockImplementation((from, to) => [from, to])
  calls.free.mockReturnValue(true)
  calls.height.mockReturnValue(2)
  const controls = new SceneMovement({ me, action, marker, focus, movement, onWalk })
  return { me, action, marker, focus, movement, onWalk, controls }
}

it("uses the same bound walking operation when handed to pointer controls", () => {
  const request = fixture()
  request.action.select({ kind: "fight", id: "target" })
  const walk = request.controls.walkTo
  expect(walk([0.75, 0.25])).toBe(true)
  expect(Object.isFrozen(request.controls)).toBe(true)
  expect(request.action.current).toBeNull()
  expect(request.me.path).toEqual([[0.75, 0.25]])
  expect(request.marker.position.toArray()).toEqual([0.75, 2.04, 0.25])
  expect(request.marker.visible).toBe(true)
  expect(request.onWalk).toHaveBeenCalledExactlyOnceWith([
    [0, 0],
    [1, 0],
  ])
})

it("retains a chase only when requested, and leaves the existing path intact after a failed search", () => {
  const request = fixture()
  request.action.select({ kind: "fight", id: "target" })
  expect(request.controls.walkTo([0.75, 0.25], true)).toBe(true)
  expect(request.action.fighting).toBe("target")
  const path = request.me.path
  calls.path.mockReturnValueOnce(null)
  expect(request.controls.walkTo([9.25, 9.25])).toBe(false)
  expect(request.action.current).toBeNull()
  expect(request.me.path).toBe(path)
  expect(request.onWalk).toHaveBeenCalledOnce()
})

it("clears the selected action before notifying a stop and blocks input while frozen", () => {
  const request = fixture()
  request.me.path = [
    [0.25, 0.25],
    [0.75, 0.25],
  ]
  request.action.select({ kind: "spot", id: "herbs" })
  request.onWalk.mockImplementation(() => expect(request.action.current).toBeNull())
  request.controls.freeze(true)
  expect(request.me.path).toEqual([[0.25, 0.25]])
  expect(request.marker.visible).toBe(false)
  expect(request.onWalk).toHaveBeenCalledExactlyOnceWith([[0, 0]])
  request.controls.hold([1, 0])
  request.controls.stepHeld()
  expect(request.controls.walkTo([0.75, 0.25])).toBe(false)
  expect(calls.path).not.toHaveBeenCalled()
  request.controls.freeze(false)
  request.controls.stepHeld()
  expect(calls.path).toHaveBeenCalledOnce()
})

it("does not announce a stop again for an empty or single-point path", () => {
  const request = fixture()
  request.controls.stop()
  request.me.path = [[0.25, 0.25]]
  request.controls.stop()
  expect(request.onWalk).not.toHaveBeenCalled()
})

it("places the server position only on a free cell and updates the camera focus without sending a walk", () => {
  const request = fixture()
  request.me.path = [[0.75, 0.25]]
  request.action.select({ kind: "talk", resident: "person" })
  calls.free.mockReturnValueOnce(false)
  request.controls.placePlayer([2, 3])
  expect(request.me.pos).toEqual([0.25, 0.25])
  expect(request.action.current?.kind).toBe("talk")
  request.controls.placePlayer([2, 3])
  expect(request.me.pos).toEqual([1.25, 1.75])
  expect(request.me.path).toEqual([])
  expect(request.focus.toArray()).toEqual([1.25, 2.6, 1.75])
  expect(request.action.current).toBeNull()
  expect(request.onWalk).not.toHaveBeenCalled()
})

it("slides along the first free diagonal alternative and waits for the current segment", () => {
  const request = fixture()
  request.controls.hold([1, 1])
  calls.free.mockReturnValueOnce(false).mockReturnValueOnce(true)
  request.controls.stepHeld()
  expect(calls.path).toHaveBeenCalledExactlyOnceWith([0.25, 0.25], [0.75, 0.25], true)
  request.me.path = [
    [0.25, 0.25],
    [0.75, 0.25],
  ]
  request.controls.stepHeld()
  expect(calls.path).toHaveBeenCalledOnce()
})

it("does not try another free alternative after the first free candidate has no path", () => {
  const request = fixture()
  request.controls.hold([1, 1])
  calls.path.mockReturnValueOnce(null)
  request.controls.stepHeld()
  expect(calls.free).toHaveBeenCalledOnce()
  expect(calls.path).toHaveBeenCalledOnce()
  expect(request.onWalk).not.toHaveBeenCalled()
})

it("ignores released and zero held input", () => {
  const request = fixture()
  request.controls.hold([0, 0])
  request.controls.stepHeld()
  request.controls.hold(null)
  request.controls.stepHeld()
  expect(calls.free).not.toHaveBeenCalled()
  expect(calls.path).not.toHaveBeenCalled()
})
