import { afterEach, expect, it, vi } from "vitest"
import { Scene } from "three"
import { SceneWalkers } from "#/world/scene/runtime/scene-walkers"
import { LOOKS } from "#/world/town/travellers"
import type { Avatar, Cell } from "#/world/scene/runtime/types"
import type { Item } from "#/world/scene/figure/look"

const figures = vi.hoisted(() => {
  const state: { scales: number[] } = { scales: [] }
  return state
})
vi.mock("#/world/scene/figure/figure", async () => {
  const three = await import("three")
  return {
    Figure: class {
      readonly root = new three.Group()
      item: Item = null
      constructor(_look: unknown, _unused: unknown, scale: number) {
        figures.scales.push(scale)
      }
      readonly hold = vi.fn((item: Item) => {
        this.item = item
      })
      readonly prefetch = vi.fn()
      readonly dispose = vi.fn(() => this.root.removeFromParent())
      readonly pose = vi.fn()
      readonly face = vi.fn()
      readonly refresh = vi.fn()
    },
  }
})
afterEach(() => {
  vi.unstubAllGlobals()
  figures.scales.length = 0
})

class Label extends EventTarget {
  className = ""
  textContent: string | null = ""
  readonly remove = vi.fn()
  readonly appendChild = vi.fn((node: unknown) => node)
}

function fixture() {
  vi.stubGlobal("document", { createElement: () => new Label() })
  const scene = new Scene()
  const pick = vi.fn()
  const walkers = new SceneWalkers({ scene, figureScale: 1.5, onPickPlayer: pick })
  const avatar: Avatar = { name: "フリッツ", look: LOOKS[0].look, held: null }
  return { scene, pick, walkers, avatar }
}

function remote(walkers: SceneWalkers, id = "other") {
  const found = walkers.remotes.get(id)
  if (!found) throw Error("Missing remote walker")
  return found
}

it("keeps the initial figure scale and exposes current movement references", () => {
  const f = fixture()
  expect(figures.scales).toEqual([1.5])
  expect(f.walkers.me.pos).toEqual([19.25, 40.25])
  f.walkers.me.pos = [2, 3]
  f.walkers.me.path = [[3, 3]]
  expect(f.walkers.movement.pos).toBe(f.walkers.me.pos)
  expect(f.walkers.movement.path).toBe(f.walkers.me.path)
})

it("adds names to the attached layer and routes clicks to the selected player", () => {
  const f = fixture()
  const layer = document.createElement("div")
  f.walkers.layer = layer
  f.walkers.addRemote("other", f.avatar, [4, 8])
  const person = remote(f.walkers)
  expect(layer.appendChild).toHaveBeenCalledWith(person.label)
  expect(person.label.className).toBe("gx-nameplate gx-nameplate--player")
  const click = new Event("click")
  const stop = vi.spyOn(click, "stopPropagation")
  person.label.dispatchEvent(click)
  expect(stop).toHaveBeenCalledOnce()
  expect(f.pick).toHaveBeenCalledExactlyOnceWith("other")
})

it("reuses repeated arrivals, updates their name and replaces their path", () => {
  const f = fixture()
  f.walkers.addRemote("other", f.avatar, [4, 8])
  const person = remote(f.walkers)
  const figure = person.fig
  f.walkers.addRemote("other", { ...f.avatar, name: "エルナ" }, [5, 8])
  expect(f.walkers.remotes.size).toBe(1)
  expect(remote(f.walkers)).toBe(person)
  expect(person.fig).toBe(figure)
  expect(person.label.textContent).toBe("エルナ")
  expect(person.path).toEqual([[2.75, 4.25]])
})

it("preserves the strict missed-path threshold and copies server cells", () => {
  const f = fixture()
  f.walkers.addRemote("other", f.avatar, [4, 8])
  const person = remote(f.walkers)
  f.walkers.moveRemote("other", [[8, 8]])
  expect(person.pos).toEqual([2.25, 4.25])
  const cells: Cell[] = [[9, 8]]
  f.walkers.moveRemote("other", cells)
  cells[0][0] = 99
  expect(person.pos).toEqual([4.75, 4.25])
  expect(person.path).toEqual([[4.75, 4.25]])
  const path = person.path
  f.walkers.moveRemote("other", [])
  expect(person.path).toBe(path)
})

it("disposes figures and names on removal and clears every remaining player", () => {
  const f = fixture()
  f.walkers.addRemote("other", f.avatar, [4, 8])
  f.walkers.addRemote("second", f.avatar, [6, 8])
  const person = remote(f.walkers)
  const second = remote(f.walkers, "second")
  f.walkers.removeRemote("other")
  expect(person.fig.dispose).toHaveBeenCalledOnce()
  expect(person.label.remove).toHaveBeenCalledOnce()
  expect(vi.mocked(person.fig.dispose).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(person.label.remove).mock.invocationCallOrder[0])
  expect(f.walkers.remotes.has("other")).toBe(false)
  f.walkers.clearRemotes()
  expect(second.fig.dispose).toHaveBeenCalledOnce()
  expect(second.label.remove).toHaveBeenCalledOnce()
  expect(f.walkers.remotes.size).toBe(0)
  expect(f.scene.children).toEqual([f.walkers.me.fig.root])
})

it("keeps frozen-instance action accessors and extracted motion callbacks usable", () => {
  const f = fixture()
  f.walkers.action = { anim: "sit", until: Infinity }
  const step = f.walkers.stepWalker
  step(f.walkers.me, 0.1)
  expect(f.walkers.me.fig.pose).toHaveBeenCalledWith("sit", expect.any(Number))
  expect(f.walkers.action).toEqual({ anim: "sit", until: Infinity })
  f.walkers.action = null
  expect(f.walkers.action).toBeNull()
})

it("ignores delayed updates and movement after a player has left", () => {
  const f = fixture()
  f.walkers.updateRemote("missing", f.avatar)
  f.walkers.moveRemote("missing", [[4, 8]])
  f.walkers.removeRemote("missing")
  expect(f.walkers.remotes.size).toBe(0)
  expect(f.scene.children).toEqual([f.walkers.me.fig.root])
})

it("releases the current local figure after appearance replacement and closes only once", () => {
  const f = fixture()
  const initial = f.walkers.me.fig
  f.walkers.setAvatar(f.avatar)
  const current = f.walkers.me.fig
  f.walkers.addRemote("other", f.avatar, [4, 8])
  const person = remote(f.walkers)
  f.walkers.dispose()
  f.walkers.dispose()
  expect(initial.dispose).toHaveBeenCalledOnce()
  expect(current.dispose).toHaveBeenCalledOnce()
  expect(person.fig.dispose).toHaveBeenCalledOnce()
  expect(person.label.remove).toHaveBeenCalledOnce()
  expect(f.scene.children).toEqual([])
})

it("still releases remote players when releasing the local figure fails", () => {
  const f = fixture()
  f.walkers.addRemote("other", f.avatar, [4, 8])
  const person = remote(f.walkers)
  vi.mocked(f.walkers.me.fig.dispose).mockImplementationOnce(() => {
    throw Error("release failed")
  })
  expect(() => f.walkers.dispose()).toThrow("release failed")
  expect(person.fig.dispose).toHaveBeenCalledOnce()
  expect(person.label.remove).toHaveBeenCalledOnce()
  expect(f.walkers.remotes.size).toBe(0)
})
