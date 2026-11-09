import { afterEach, expect, it, vi } from "vitest"
import { createGameState } from "#/world/client/initial-state"
import { Mutes } from "#/world/parts/mutes"

const KEY = "durable-fantasy/muted"

afterEach(() => vi.unstubAllGlobals())

function fixture(saved: string | null) {
  const stored = new Map<string, string>()
  if (saved !== null) stored.set(KEY, saved)
  vi.stubGlobal("localStorage", { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value) })
  const state = createGameState()
  const mutes = new Mutes({ state, key: KEY })
  return { state, mutes, stored }
}

it("brings back the connections muted before a reload, and keeps only well-formed ids", () => {
  const f = fixture(JSON.stringify(["a", 3, "", "x".repeat(65), "b"]))
  f.mutes.load()
  expect(f.state.get().muted).toEqual(["a", "b"])
  expect(f.mutes.has("a")).toBe(true)
  expect(f.mutes.has("c")).toBe(false)
})

it.each(["not json", JSON.stringify({ a: 1 }), null])("mutes nobody when the saved list is damaged or missing: %s", (saved) => {
  const f = fixture(saved)
  f.mutes.load()
  expect(f.state.get().muted).toEqual([])
})

it("mutes nobody and does not throw when browser storage is blocked", () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("blocked")
    },
    setItem: () => {
      throw new Error("blocked")
    },
  })
  const state = createGameState()
  const mutes = new Mutes({ state, key: KEY })
  mutes.load()
  expect(state.get().muted).toEqual([])
  // the mute still holds for this page even though it cannot be saved
  mutes.mute("a")
  expect(mutes.has("a")).toBe(true)
})

it("saves each change, keeps one entry per connection and forgets on unmute", () => {
  const f = fixture(null)
  f.mutes.mute("a")
  f.mutes.mute("b")
  f.mutes.mute("a")
  expect(f.state.get().muted).toEqual(["b", "a"])
  expect(JSON.parse(f.stored.get(KEY)!)).toEqual(["b", "a"])
  f.mutes.unmute("b")
  f.mutes.unmute("unknown")
  expect(f.state.get().muted).toEqual(["a"])
  expect(JSON.parse(f.stored.get(KEY)!)).toEqual(["a"])
})

it("remembers at most a hundred connections, forgetting the oldest first", () => {
  const f = fixture(JSON.stringify(Array.from({ length: 120 }, (_, index) => `old-${index}`)))
  f.mutes.load()
  expect(f.state.get().muted).toHaveLength(100)
  expect(f.state.get().muted[0]).toBe("old-20")
  f.mutes.mute("new")
  expect(f.state.get().muted).toHaveLength(100)
  expect(f.mutes.has("old-20")).toBe(false)
  expect(f.state.get().muted.at(-1)).toBe("new")
})
