import { expect, it, vi } from "vitest"
import { SceneResidentNames } from "#/world/scene/runtime/scene-resident-names"
import type { V2 } from "#/world/scene/construction/registry"

function resident(name: string, pos: V2) {
  return { name, pos, fig: { root: { visible: true } } }
}

function fixture() {
  const near = resident("near", [5.99, 0])
  const edge = resident("edge", [6, 0])
  const hidden = resident("hidden", [1, 0])
  hidden.fig.root.visible = false
  const people = [near, edge, hidden]
  const me: { pos: V2 } = { pos: [0, 0] }
  const create = vi.fn((name: string) => ({ name, classList: { add: vi.fn(), remove: vi.fn() } }))
  const place = vi.fn()
  const names = new SceneResidentNames({ people, me, create, place })
  return { people, near, edge, hidden, me, create, place, names }
}

it("creates one nameplate per resident in their existing order", () => {
  const f = fixture()
  expect(f.create.mock.calls).toEqual([["near"], ["edge"], ["hidden"]])
  expect(f.names.elements.map((e) => e.name)).toEqual(["near", "edge", "hidden"])
  f.names.elements.pop()
  expect(f.names.elements).toHaveLength(3)
})

it("keeps the strict distance boundary and hides invisible figures even under the pointer", () => {
  const f = fixture()
  f.names.update(null)
  expect(f.place.mock.calls.map((call) => call[2])).toEqual([true, false, false])
  f.place.mockClear()
  f.names.update(f.hidden)
  expect(f.place.mock.calls.map((call) => call[2])).toEqual([true, false, false])
})

it("shows an out-of-range resident under the pointer and tracks the player's current position", () => {
  const f = fixture()
  f.names.update(f.edge)
  expect(f.place).toHaveBeenCalledWith(f.edge, f.names.elements[1], true)
  f.me.pos = [20, 20]
  f.place.mockClear()
  f.names.update(null)
  expect(f.place.mock.calls.map((call) => call[2])).toEqual([false, false, false])
})

it("changes hover classes only on transitions, clearing the old name before marking the next", () => {
  const f = fixture()
  const first = f.names.elements[0]
  const second = f.names.elements[1]
  f.names.update(f.near)
  f.names.update(f.near)
  expect(first.classList.add).toHaveBeenCalledExactlyOnceWith("gx-nameplate--hover")
  f.names.update(f.edge)
  expect(first.classList.remove).toHaveBeenCalledExactlyOnceWith("gx-nameplate--hover")
  expect(first.classList.remove.mock.invocationCallOrder[0]).toBeLessThan(second.classList.add.mock.invocationCallOrder[0])
  f.names.update(resident("unknown", [0, 0]))
  expect(second.classList.remove).toHaveBeenCalledExactlyOnceWith("gx-nameplate--hover")
})
