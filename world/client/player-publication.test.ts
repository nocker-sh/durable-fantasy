import { expect, it, vi } from "vitest"
import { currentPublication } from "#/world/client/player-publication"
import { ServerMessages } from "#/world/client/server-messages"
import { GameSession } from "#/world/client/game-session"
import { player } from "#/world/test/player"

type Context = ConstructorParameters<typeof ServerMessages>[0]
function fixture() {
  const session = new GameSession()
  const newest = player({ revision: 3, hp: 20, gold: 5, party: null })
  session.state.set((s) => ({ ...s, player: newest }))
  const setPlayer = vi.fn((value) => session.state.set((s) => ({ ...s, player: value })))
  const report = vi.fn()
  const maybeReady = vi.fn()
  const messages = new ServerMessages({ session, setPlayer, report, maybeReady, getScene: () => null, wayBeside: () => null } as unknown as Context)
  return { session, newest, setPlayer, report, maybeReady, messages }
}
it("ignores a late combat snapshot and its events after a newer command, while accepting the next publication", () => {
  const f = fixture()
  f.messages.handle({ type: "result", seq: -1, result: { ok: true, state: player({ revision: 2, hp: 0, gold: 10 }), events: [{ type: "fell", by: "スライム" }] } })
  expect(f.setPlayer).not.toHaveBeenCalled()
  expect(f.report).not.toHaveBeenCalled()
  expect(f.session.state.get().player).toEqual(f.newest)
  const next = player({ revision: 4, hp: 19, gold: 5 })
  f.messages.handle({ type: "result", seq: -1, result: { ok: true, state: next, events: [{ type: "hurt", amount: 1, by: "スライム", hp: 19 }] } })
  expect(f.setPlayer).toHaveBeenCalledExactlyOnceWith(next)
  expect(f.report).toHaveBeenCalledOnce()
})
it("welcomes a room without letting its delayed initial snapshot replace newer player state", () => {
  const f = fixture()
  f.messages.handle({ type: "snapshot", you: "connection", me: player({ revision: 2, hp: 0, party: "previous" }), players: [] })
  expect(f.session.others.you).toBe("connection")
  expect(f.setPlayer).not.toHaveBeenCalled()
  expect(f.session.state.get().player).toEqual(f.newest)
  expect(f.maybeReady).toHaveBeenCalledOnce()
})
it.each([-1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1])("refuses invalid publication counter %s", (revision) => {
  expect(currentPublication(null, player({ revision }))).toBe(false)
})
it("treats missing legacy counters as the initial publication, never as newer data", () => {
  const { revision: _revision, ...legacy } = player()
  const old = legacy as ReturnType<typeof player>
  expect(currentPublication(null, old)).toBe(true)
  expect(currentPublication(player({ revision: 1 }), old)).toBe(false)
})
