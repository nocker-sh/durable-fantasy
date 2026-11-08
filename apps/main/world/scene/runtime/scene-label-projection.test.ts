import { afterEach, expect, it, vi } from "vitest"
import { Camera } from "three"
import { SceneLabelProjection } from "#/world/scene/runtime/scene-label-projection"
import { ScreenLabels } from "#/lib/graphics/screen-labels"
import { walkH } from "#/world/scene/walk-h"

vi.mock("#/world/scene/walk-h", () => ({ walkH: vi.fn(() => 0.2) }))

afterEach(() => vi.restoreAllMocks())

function fixture() {
  const place = vi.spyOn(ScreenLabels.prototype, "place").mockImplementation(() => {})
  const viewport = { width: 801, height: 603 }
  const projection = new SceneLabelProjection({ camera: new Camera(), viewport })
  const element = Object.create(null)
  return { place, viewport, projection, element }
}

it("uses the supplied ground, rounds viewport pixels and applies the label offset afterward", () => {
  const f = fixture()
  f.projection.place({ element: f.element, pos: [0, 0], height: 0.1, ground: 0.1, offset: 2 })
  expect(f.place).toHaveBeenLastCalledWith({ element: f.element, visible: true, x: 401, y: 239 })
  f.viewport.width = 1000
  f.viewport.height = 500
  f.projection.place({ element: f.element, pos: [0, 0], height: 0.1, ground: 0.1, offset: 20 })
  expect(f.place).toHaveBeenLastCalledWith({ element: f.element, visible: true, x: 500, y: 180 })
})

it("uses terrain only when ground is absent and skips it for explicitly hidden elements", () => {
  const f = fixture()
  vi.mocked(walkH).mockClear()
  f.projection.place({ element: f.element, pos: [0, 0], height: 0 })
  expect(walkH).toHaveBeenCalledWith(0, 0)
  vi.mocked(walkH).mockClear()
  f.projection.place({ element: f.element, pos: [0, 0], height: 0, ground: 0 })
  f.projection.place({ element: f.element, pos: [2, 2], height: 0, visible: false })
  expect(walkH).not.toHaveBeenCalled()
  expect(f.place).toHaveBeenLastCalledWith({ element: f.element, visible: false })
})

it("keeps the strict screen margin and far-plane boundaries", () => {
  const f = fixture()
  for (const pos of [
    [1.1, 0],
    [-1.1, 0],
    [0, 1],
  ]) {
    f.projection.place({ element: f.element, pos: [pos[0], pos[1]], height: 0, ground: 0 })
    expect(f.place.mock.calls.at(-1)?.[0].visible).toBe(false)
  }
  f.projection.place({ element: f.element, pos: [1.09, 0.99], height: 1.09, ground: 0 })
  expect(f.place.mock.calls.at(-1)?.[0].visible).toBe(true)
})
