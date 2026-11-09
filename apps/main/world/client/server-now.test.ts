import { afterEach, expect, it, vi } from "vitest"
import { serverNow } from "#/world/client/server-now"
import { ServerMessages } from "#/world/client/server-messages"
import { GameSession } from "#/world/client/game-session"
import { player } from "#/world/test/player"
import type { GameState } from "#/world/state"

type Context = ConstructorParameters<typeof ServerMessages>[0]

afterEach(() => vi.useRealTimers())

function fixture() {
  const session = new GameSession()
  const update = (patch: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => session.state.set((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }))
  const messages = new ServerMessages({ session, update, setPlayer: vi.fn(), maybeReady: vi.fn(), getScene: () => null, wayBeside: () => null } as unknown as Context)
  return { session, messages }
}

it("adds the measured difference to this device's clock", () => {
  expect(serverNow({ clockOffset: 0 }, 5_000)).toBe(5_000)
  expect(serverNow({ clockOffset: 60_000 }, 5_000)).toBe(65_000)
  expect(serverNow({ clockOffset: -60_000 }, 100_000)).toBe(40_000)
})

it("measures the room's clock on each welcome and keeps the last difference when a welcome carries none", () => {
  const f = fixture()
  // this device's clock is a minute slow
  vi.setSystemTime(1_000_000)
  f.messages.handle({ type: "snapshot", you: "first", me: player(), players: [], now: 1_060_000 })
  expect(f.session.state.get().clockOffset).toBe(60_000)
  vi.setSystemTime(1_010_000)
  expect(serverNow(f.session.state.get())).toBe(1_070_000)
  // the next room's welcome measures again
  f.messages.handle({ type: "snapshot", you: "second", me: player(), players: [], now: 1_069_000 })
  expect(f.session.state.get().clockOffset).toBe(59_000)
  f.messages.handle({ type: "snapshot", you: "third", me: player(), players: [] })
  f.messages.handle({ type: "snapshot", you: "fourth", me: player(), players: [], now: Number.NaN })
  expect(f.session.state.get().clockOffset).toBe(59_000)
})

it("starts from this device's clock before any room has answered", () => {
  vi.setSystemTime(2_000_000)
  expect(serverNow(new GameSession().state.get())).toBe(2_000_000)
})
