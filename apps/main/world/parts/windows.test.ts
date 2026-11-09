import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { Windows } from "#/world/parts/windows"
import { createGameState } from "#/world/client/initial-state"
import { DEFAULT_WINDOWS } from "#/world/state"
import type { GameState } from "#/world/state"

const KEY = "test/windows"

// Stored keys are listed by Object.keys, as in the browser; the methods are not.
function fakeStorage() {
  const saved: Record<string, string> = {}
  return Object.defineProperties(saved, {
    getItem: { value: (key: string) => (Object.hasOwn(saved, key) ? saved[key] : null) },
    setItem: { value: (key: string, value: string) => void (saved[key] = value) },
    removeItem: { value: (key: string) => void delete saved[key] },
  })
}

beforeEach(() => vi.stubGlobal("localStorage", fakeStorage()))
afterEach(() => vi.unstubAllGlobals())

function fixture(open: GameState["windows"]) {
  const state = createGameState()
  state.set({ ...state.get(), windows: open })
  return { state, windows: new Windows(state, KEY) }
}

it("puts a shop in front when it opens, and a window touched after it in front of the shop (ui.md §2.1)", () => {
  const f = fixture([...DEFAULT_WINDOWS, "skills"])
  f.windows.focus("shop")
  expect(f.state.get().windows).toEqual([...DEFAULT_WINDOWS, "skills", "shop"])
  f.windows.focus("skills")
  expect(f.state.get().windows).toEqual([...DEFAULT_WINDOWS, "shop", "skills"])
  f.windows.focus("shop")
  expect(f.state.get().windows).toEqual([...DEFAULT_WINDOWS, "skills", "shop"])
  f.windows.unstack("shop")
  expect(f.state.get().windows).toEqual([...DEFAULT_WINDOWS, "skills"])
})

it("does not open a closed window when it is touched", () => {
  const f = fixture([...DEFAULT_WINDOWS])
  f.windows.focus("skills")
  expect(f.state.get().windows).toEqual(DEFAULT_WINDOWS)
})

it("remembers only the windows the player opens and closes (ui.md §5)", () => {
  const f = fixture([...DEFAULT_WINDOWS])
  f.windows.focus("trade")
  f.windows.toggle("inventory")
  expect(f.state.get().windows).toEqual([...DEFAULT_WINDOWS, "trade", "inventory"])
  expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([...DEFAULT_WINDOWS, "inventory"])
  localStorage.setItem(KEY, JSON.stringify(["inventory", "shop"]))
  expect(f.windows.load()).toEqual(["inventory"])
})

it("keeps a shown shop in front when the layout is reset", () => {
  const f = fixture([...DEFAULT_WINDOWS, "inventory", "shop", "skills"])
  localStorage.setItem("ui-window/skills", JSON.stringify({ x: 0, y: 0, folded: true }))
  f.windows.reset()
  expect(f.state.get().windows).toEqual([...DEFAULT_WINDOWS, "shop"])
  expect(localStorage.getItem("ui-window/skills")).toBeNull()
  expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(DEFAULT_WINDOWS)
})
