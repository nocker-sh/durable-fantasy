import { expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { GameSession } from "#/world/client/game-session"
import { SocialActions } from "#/world/client/social"
import { TRADE_GOLD_MAX, TRADE_LOTS } from "#/world/core/trade-rules"
import { player } from "#/world/test/player"

function fixture() {
  const session = new GameSession()
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  session.state.set((state) => ({ ...state, player: player({ threads: [{ key: "k", name: "Hans", town: 3, at: 0 }] }) }))
  const target = { session, update: vi.fn(), notify: vi.fn(), enterMap: vi.fn(), addChat: vi.fn(), getScene: () => null }
  return { session, send, target, actions: new SocialActions(target) }
}

const lots = (n: number) => Array.from({ length: n }, (_, slot) => ({ slot, count: 1 }))

it("puts up to a full table on offer and says so for one more, without dropping the socket", () => {
  const f = fixture()
  f.actions.offerTrade(lots(TRADE_LOTS), 10)
  expect(f.send).toHaveBeenCalledExactlyOnceWith({ type: "trade-offer", lots: lots(TRADE_LOTS), gold: 10 })
  f.actions.offerTrade(lots(TRADE_LOTS + 1), 10)
  f.actions.offerTrade([], TRADE_GOLD_MAX + 1)
  expect(f.send).toHaveBeenCalledOnce()
  expect(f.target.notify.mock.calls).toEqual([
    ["これ以上は出せない。", "bad"],
    ["これ以上は出せない。", "bad"],
  ])
})

it.each([
  ["talking", { dialogue: { resident: 0, name: "アルノルト", job: "鍛冶屋", pages: [""], page: 0, choices: [], shownAt: 0 } }, "会話や店の最中は移れない。"],
  ["in a shop", { shop: "bakery" as const }, "会話や店の最中は移れない。"],
  [
    "trading",
    { trade: { with: "other", name: "Hans", lots: [], mine: { stacks: [], gold: 0, locked: false, done: false }, theirs: { stacks: [], gold: 0, locked: false, done: false } } },
    "取引の最中は移れない。",
  ],
])("says why a thread cannot be followed while %s", (_while, patch, reason) => {
  const f = fixture()
  f.session.state.set((state) => ({ ...state, ...patch }))
  f.actions.visitTown(3)
  expect(f.target.notify).toHaveBeenCalledExactlyOnceWith(reason, "bad")
  expect(f.target.enterMap).not.toHaveBeenCalled()
  expect(f.session.rooms.world).toBe(1)
})

it("follows a thread with nothing of this room in hand", () => {
  const f = fixture()
  f.actions.visitTown(3)
  expect(f.target.notify).not.toHaveBeenCalled()
  expect(f.session.rooms.world).toBe(3)
  expect(f.target.enterMap).toHaveBeenCalledExactlyOnceWith("phanthiet", null)
  expect(f.target.addChat).toHaveBeenCalledWith({ channel: "system", text: "糸をたどって、Hansの町に渡った。" })
})
