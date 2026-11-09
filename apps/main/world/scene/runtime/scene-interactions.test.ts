import { afterEach, expect, it, vi } from "vitest"
import { SceneInteractions } from "#/world/scene/runtime/scene-interactions"
import { PendingAction } from "#/world/scene/runtime/action-target"
import type { SceneMovement } from "#/world/scene/runtime/scene-movement"
import type { Walker } from "#/world/scene/runtime/walker"
import type { V2 } from "#/world/scene/construction/registry"

const free = vi.hoisted(() => vi.fn<(x: number, z: number) => boolean>())
vi.mock("#/world/scene/is-free", () => ({ isFree: free }))
afterEach(() => vi.resetAllMocks())

function fixture() {
  const me: Pick<Walker, "pos" | "path"> = { pos: [0, 0], path: [] }
  const resident: { pos: V2; name: string } = { pos: [3, 0], name: "keeper" }
  const action = new PendingAction<typeof resident>()
  const movement = {
    frozen: false,
    walkTo: vi.fn<SceneMovement["walkTo"]>((point, keep) => {
      if (!keep) action.clear()
      me.path = [point]
      return true
    }),
  }
  const personOf = vi.fn((id: number) => (id === 1 ? resident : undefined))
  const reach = vi.fn<(person: typeof resident) => void>()
  const stationAt = vi.fn<(id: string) => void>()
  const gatherAt = vi.fn<(id: string) => void>()
  const marker = { visible: true }
  const spots = new Map<string, { at: V2 }>([
    ["herbs", { at: [3, 0] }],
    ["station:forge", { at: [3, 0] }],
  ])
  free.mockReturnValue(true)
  const controls = new SceneInteractions({ me, action, movement, personOf, reach, stationAt, gatherAt, marker, spots })
  return { me, resident, action, movement, personOf, reach, stationAt, gatherAt, marker, controls }
}

it("consumes a gathered destination before a callback selects its next action", () => {
  const request = fixture()
  request.action.select({ kind: "spot", id: "herbs" })
  request.gatherAt.mockImplementation(() => {
    expect(request.action.current).toBeNull()
    expect(request.marker.visible).toBe(false)
    request.action.select({ kind: "talk", resident: request.resident })
  })
  const arrive = request.controls.arrive
  arrive()
  expect(request.gatherAt).toHaveBeenCalledExactlyOnceWith("herbs")
  expect(request.action.current).toEqual({ kind: "talk", resident: request.resident })
})

it("routes a station arrival without forwarding its prefix and retains a fight across short paths", () => {
  const request = fixture()
  request.action.select({ kind: "spot", id: "station:forge" })
  request.controls.arrive()
  expect(request.stationAt).toHaveBeenCalledExactlyOnceWith("forge")
  request.action.select({ kind: "fight", id: "target" })
  request.controls.arrive()
  expect(request.action.fighting).toBe("target")
  expect(request.gatherAt).not.toHaveBeenCalled()
  expect(request.reach).not.toHaveBeenCalled()
})

it("keeps an existing action when frozen or the selected spot is missing", () => {
  const request = fixture()
  request.action.select({ kind: "fight", id: "target" })
  request.movement.frozen = true
  request.controls.approachSpot("herbs")
  request.controls.approach(1)
  request.movement.frozen = false
  request.controls.approachSpot("absent")
  request.controls.approach(2)
  expect(request.action.fighting).toBe("target")
  expect(request.movement.walkTo).not.toHaveBeenCalled()
  expect(request.gatherAt).not.toHaveBeenCalled()
})

it("starts a nearby spot immediately after clearing the previous action", () => {
  const request = fixture()
  request.me.pos = [3, 0]
  request.action.select({ kind: "fight", id: "target" })
  request.gatherAt.mockImplementation(() => expect(request.action.current).toBeNull())
  request.controls.approachSpot("herbs")
  expect(request.gatherAt).toHaveBeenCalledExactlyOnceWith("herbs")
  expect(free).not.toHaveBeenCalled()
})

it("continues past a blocked or unreachable candidate and waits for arrival before gathering", () => {
  const request = fixture()
  free.mockReturnValueOnce(false)
  request.movement.walkTo.mockReturnValueOnce(false)
  request.controls.approachSpot("herbs")
  expect(free).toHaveBeenCalledTimes(3)
  expect(request.movement.walkTo).toHaveBeenCalledTimes(2)
  expect(request.action.current).toEqual({ kind: "spot", id: "herbs" })
  expect(request.gatherAt).not.toHaveBeenCalled()
  request.controls.arrive()
  expect(request.gatherAt).toHaveBeenCalledExactlyOnceWith("herbs")
})

it("immediately dispatches a successful zero-length path after consuming its spot reservation", () => {
  const request = fixture()
  request.movement.walkTo.mockReturnValueOnce(true)
  request.stationAt.mockImplementation(() => expect(request.action.current).toBeNull())
  request.controls.approachSpot("station:forge")
  expect(request.stationAt).toHaveBeenCalledExactlyOnceWith("forge")
})

it("does not gather if every approach point is blocked", () => {
  const request = fixture()
  free.mockReturnValue(false)
  request.action.select({ kind: "fight", id: "old" })
  request.controls.approachSpot("herbs")
  expect(request.action.current).toBeNull()
  expect(request.movement.walkTo).not.toHaveBeenCalled()
  expect(request.gatherAt).not.toHaveBeenCalled()
})

it("consumes the conversation reservation before notifying a nearby resident", () => {
  const request = fixture()
  request.me.pos = [2, 0]
  request.reach.mockImplementation(() => expect(request.action.current).toBeNull())
  request.controls.approach(1)
  expect(request.reach).toHaveBeenCalledExactlyOnceWith(request.resident)
  expect(request.movement.walkTo).not.toHaveBeenCalled()
})

it("keeps the resident selected during the walk and consumes it only on arrival", () => {
  const request = fixture()
  request.controls.approach(1)
  expect(request.movement.walkTo).toHaveBeenCalledWith(expect.any(Array), true)
  expect(request.action.current).toEqual({ kind: "talk", resident: request.resident })
  expect(request.reach).not.toHaveBeenCalled()
  request.controls.arrive()
  expect(request.action.current).toBeNull()
  expect(request.reach).toHaveBeenCalledExactlyOnceWith(request.resident)
})

it("retains the existing conversation fallback after exhausting all free-point searches", () => {
  const request = fixture()
  free.mockReturnValue(false)
  request.controls.approach(1)
  expect(free).toHaveBeenCalledTimes(32)
  expect(request.action.current).toBeNull()
  expect(request.reach).toHaveBeenCalledExactlyOnceWith(request.resident)
})
