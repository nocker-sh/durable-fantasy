import { afterEach, expect, it, vi } from "vitest"
import { Group } from "three"
import { SceneOutlines } from "#/world/scene/runtime/scene-outlines"
import { outlineShape } from "#/lib/graphics/outline-shape"
import type { Figure } from "#/world/scene/figure/figure"
import type { Spawn } from "#/world/core/monster-types"

vi.mock("#/lib/graphics/outline-shape", () => ({ outlineShape: vi.fn() }))
afterEach(() => vi.clearAllMocks())

function person() {
  return { fig: { outline: vi.fn<Figure["outline"]>(), xray: vi.fn<Figure["xray"]>() } }
}

function creature(id: string) {
  const spawn: Spawn = { id, map: "field", kind: "slime", area: [0, 0, 1, 1] }
  return { spawn, body: new Group() }
}

function fixture(preview = false) {
  const me = person()
  const people = [person(), person()]
  const walker = person()
  const remotes = new Map([["other", walker]])
  const monsters = [creature("first"), creature("second")]
  const critters = [{ outline: vi.fn<(on: boolean) => void>() }, { outline: vi.fn<(on: boolean) => void>() }]
  const pointer: { hovered: typeof me | null; hoveredWalker: typeof me | null; hoveredMonster: string | null; hoveredCritter: (typeof critters)[0] | null } = {
    hovered: people[1],
    hoveredWalker: walker,
    hoveredMonster: "second",
    hoveredCritter: critters[1],
  }
  return { me, people, walker, remotes, monsters, critters, pointer, outlines: new SceneOutlines({ me, people, remotes, monsters, critters, pointer, preview }) }
}

it("always outlines the player and marks just the hovered owner in each other category", () => {
  const f = fixture()
  f.outlines.update(true)
  expect(f.me.fig.xray).toHaveBeenCalledExactlyOnceWith(true)
  expect(f.me.fig.outline).toHaveBeenCalledExactlyOnceWith(true, true)
  expect(f.me.fig.xray.mock.invocationCallOrder[0]).toBeLessThan(f.me.fig.outline.mock.invocationCallOrder[0])
  expect(f.people[0].fig.outline).toHaveBeenCalledExactlyOnceWith(false)
  expect(f.people[1].fig.outline).toHaveBeenCalledExactlyOnceWith(true)
  expect(f.walker.fig.outline).toHaveBeenCalledExactlyOnceWith(true)
  expect(vi.mocked(outlineShape).mock.calls).toEqual([
    [f.monsters[0].body, false],
    [f.monsters[1].body, true],
  ])
  expect(f.critters[0].outline).toHaveBeenCalledExactlyOnceWith(false)
  expect(f.critters[1].outline).toHaveBeenCalledExactlyOnceWith(true)
})

it("skips the preview player while still synchronizing the other outlines", () => {
  const f = fixture(true)
  f.outlines.update(true)
  expect(f.me.fig.xray).not.toHaveBeenCalled()
  expect(f.me.fig.outline).not.toHaveBeenCalled()
  expect(f.people[1].fig.outline).toHaveBeenCalledExactlyOnceWith(true)
  expect(outlineShape).toHaveBeenCalledTimes(2)
})

it("clears old hover flags and reads the current player figure and remote collection", () => {
  const f = fixture()
  f.outlines.update(true)
  const previous = f.me.fig
  f.me.fig = person().fig
  f.pointer.hovered = null
  f.pointer.hoveredMonster = null
  f.pointer.hoveredCritter = null
  f.remotes.delete("other")
  const added = person()
  f.remotes.set("new", added)
  f.pointer.hoveredWalker = added
  const update = f.outlines.update
  update(false)
  expect(previous.outline).toHaveBeenCalledOnce()
  expect(f.me.fig.xray).toHaveBeenCalledExactlyOnceWith(false)
  expect(f.me.fig.outline).toHaveBeenCalledExactlyOnceWith(true, false)
  expect(f.walker.fig.outline).toHaveBeenCalledOnce()
  expect(added.fig.outline).toHaveBeenCalledExactlyOnceWith(true)
  expect(f.people[1].fig.outline).toHaveBeenLastCalledWith(false)
  expect(vi.mocked(outlineShape).mock.calls.slice(-2)).toEqual([
    [f.monsters[0].body, false],
    [f.monsters[1].body, false],
  ])
  expect(f.critters[1].outline).toHaveBeenLastCalledWith(false)
})
