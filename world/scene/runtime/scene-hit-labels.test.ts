import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { SceneHitLabels } from "#/world/scene/runtime/scene-hit-labels"
import type { SceneLabelProjection } from "#/world/scene/runtime/scene-label-projection"

beforeEach(() => vi.stubGlobal("document", { createElement: () => ({ remove: vi.fn() }) }))
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function fixture() {
  vi.useFakeTimers()
  const element = document.createElement("div")
  const remove = vi.spyOn(element, "remove")
  const plate = vi.fn(() => element)
  const place = vi.fn<SceneLabelProjection["place"]>()
  return { element, remove, plate, place, labels: new SceneHitLabels({ plate, place }) }
}

it("uses the existing hit style and projection and removes the label at its exact expiry", () => {
  const f = fixture()
  f.labels.show({ kind: "critical", text: "12", pos: [2, 3], height: 0.5 })
  expect(f.plate).toHaveBeenCalledExactlyOnceWith("gx-hit gx-hit--critical", "12")
  expect(f.place).toHaveBeenCalledExactlyOnceWith({ element: f.element, pos: [2, 3], height: 0.5 })
  vi.advanceTimersByTime(899)
  expect(f.remove).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(f.remove).toHaveBeenCalledOnce()
  f.labels.dispose()
  expect(f.remove).toHaveBeenCalledOnce()
})

it("clears active timers and elements together and ignores later displays after disposal", () => {
  const f = fixture()
  f.labels.show({ kind: "taken", text: "4", pos: [1, 2], height: 1 })
  expect(vi.getTimerCount()).toBe(1)
  f.labels.dispose()
  f.labels.dispose()
  expect(vi.getTimerCount()).toBe(0)
  expect(f.remove).toHaveBeenCalledOnce()
  f.labels.show({ kind: "miss", text: "ミス", pos: [2, 3], height: 0.5 })
  vi.advanceTimersByTime(900)
  expect(f.plate).toHaveBeenCalledOnce()
  expect(f.remove).toHaveBeenCalledOnce()
})

it("releases every overlapping hit display", () => {
  vi.useFakeTimers()
  const first = document.createElement("div")
  const second = document.createElement("div")
  const firstRemove = vi.spyOn(first, "remove")
  const secondRemove = vi.spyOn(second, "remove")
  const plate = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second)
  const labels = new SceneHitLabels({ plate, place: vi.fn() })
  labels.show({ kind: "hit", text: "1", pos: [0, 0], height: 0.5 })
  vi.advanceTimersByTime(200)
  labels.show({ kind: "hit", text: "2", pos: [0, 0], height: 0.5 })
  expect(vi.getTimerCount()).toBe(2)
  vi.advanceTimersByTime(700)
  expect(firstRemove).toHaveBeenCalledOnce()
  expect(secondRemove).not.toHaveBeenCalled()
  labels.dispose()
  expect(firstRemove).toHaveBeenCalledOnce()
  expect(secondRemove).toHaveBeenCalledOnce()
  expect(vi.getTimerCount()).toBe(0)
})

it("removes an acquired label if projection fails and preserves the error", () => {
  const f = fixture()
  const failure = Error("projection failed")
  f.place.mockImplementationOnce(() => {
    throw failure
  })
  expect(() => f.labels.show({ kind: "hit", text: "3", pos: [1, 2], height: 0.5 })).toThrow(failure)
  expect(f.remove).toHaveBeenCalledOnce()
  expect(vi.getTimerCount()).toBe(0)
  f.labels.dispose()
  expect(f.remove).toHaveBeenCalledOnce()
})
