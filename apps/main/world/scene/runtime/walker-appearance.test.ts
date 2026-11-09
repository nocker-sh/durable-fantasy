import { expect, it, vi } from "vitest"
import { WalkerAppearance } from "#/world/scene/runtime/walker-appearance"
import { LOOKS } from "#/world/town/travellers"
import type { Avatar } from "#/world/scene/runtime/types"
import type { Item } from "#/world/scene/figure/look"
import type { Anim } from "#/world/scene/figure/animation"

function figure() {
  const state: { item: Item } = { item: null }
  return {
    get item() {
      return state.item
    },
    hold: vi.fn((item: Item) => {
      state.item = item
    }),
    prefetch: vi.fn<(anim: Anim, item: Item) => void>(),
    dispose: vi.fn(),
  }
}

function fixture() {
  const avatar: Avatar = { name: "エルナ", look: LOOKS[0].look, held: null }
  const events: string[] = []
  const initial = figure()
  initial.dispose.mockImplementation(() => {
    events.push("dispose")
  })
  const makeFigure = vi.fn((avatar: Avatar) => {
    events.push("create")
    const next = figure()
    next.hold(avatar.held)
    return next
  })
  const walker = { name: "", fig: initial, label: { textContent: "" } }
  return { avatar, initial, makeFigure, walker, events, appearance: new WalkerAppearance({ makeFigure }) }
}

it("replaces an unregistered appearance in the existing release order and skips unchanged local equipment", () => {
  const f = fixture()
  f.appearance.update(f.walker, f.avatar)
  expect(f.events).toEqual(["dispose", "create"])
  expect(f.walker.label.textContent).toBe("エルナ")
  const current = f.walker.fig
  expect(current.prefetch.mock.calls).toEqual([
    ["idle", null],
    ["walk", null],
  ])
  f.appearance.update(f.walker, { ...f.avatar, name: "フリッツ" })
  expect(f.walker.fig).toBe(current)
  expect(f.makeFigure).toHaveBeenCalledOnce()
  expect(current.prefetch).toHaveBeenCalledTimes(2)
  expect(f.walker.label.textContent).toBe("フリッツ")
})

it("updates equipment without replacing the figure", () => {
  const f = fixture()
  f.appearance.remember(f.walker, f.avatar)
  f.appearance.update(f.walker, { ...f.avatar, held: "sword" })
  expect(f.walker.fig).toBe(f.initial)
  expect(f.makeFigure).not.toHaveBeenCalled()
  expect(f.initial.hold).toHaveBeenCalledExactlyOnceWith("sword")
  expect(f.initial.prefetch.mock.calls.slice(-2)).toEqual([
    ["idle", "sword"],
    ["walk", "sword"],
  ])
})

it("refreshes remote equipment and prefetch even when its held item is unchanged", () => {
  const f = fixture()
  f.appearance.remember(f.walker, f.avatar)
  f.appearance.update(f.walker, f.avatar, "remote")
  expect(f.initial.hold).toHaveBeenCalledExactlyOnceWith(null)
  expect(f.initial.prefetch).toHaveBeenCalledTimes(4)
})

it("replaces changed looks while retaining the walker and its name element", () => {
  const f = fixture()
  f.appearance.remember(f.walker, f.avatar)
  const label = f.walker.label
  f.appearance.update(f.walker, { ...f.avatar, look: { ...f.avatar.look, skin: "skin2" } })
  expect(f.initial.dispose).toHaveBeenCalledOnce()
  expect(f.walker.fig).not.toBe(f.initial)
  expect(f.walker.label).toBe(label)
  expect(f.makeFigure).toHaveBeenCalledOnce()
})
