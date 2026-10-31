import { afterEach, describe, expect, it, vi } from "vitest"
import type { ServerMessage } from "#/world/protocol"
import { emptyOffer } from "#/world/core/empty-offer"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { setPresence } from "#/world/server/map-room/set-presence"
import type { Presence } from "#/world/server/map-room/presence"
import { player } from "#/world/test/player"

vi.mock("#/durable-objects/player", () => ({
  Player: {
    get: vi.fn(() => {
      throw new Error("Invitation must not mutate inventory")
    }),
  },
}))
import { handleTradeAnswer } from "#/world/server/map-room/handle-trade-answer"

function connection(id: string, patch: Partial<Presence> = {}) {
  const state: Presence = {
    player: mapPlayer(id, player(), [10, 10]),
    owner: id,
    route: [[10, 10]],
    since: Date.now(),
    said: [],
    engaged: null,
    ...patch,
  }
  const socket = {
    id,
    state,
    send: vi.fn(async (_message: ServerMessage) => {}),
    setState(next: Presence) {
      socket.state = next
    },
  }
  return socket
}

function fixture() {
  const asker = connection("asker", { trade: { with: "recipient", open: false, offer: emptyOffer(), shown: [], locked: false, done: false } })
  const recipient = connection("recipient")
  const answer = (yes = true) =>
    handleTradeAnswer(
      {
        ctx: { connection: recipient, room: { getConnection: (id: string) => (id === asker.id ? asker : undefined) } },
        me: recipient.state,
        save: (patch: Partial<Presence>) => setPresence(recipient, patch),
      },
      { type: "trade-answer", from: asker.id, yes },
    )
  return { asker, recipient, answer }
}

afterEach(() => vi.useRealTimers())

describe("trade invitation acceptance", () => {
  it("opens a mutual trade when both players are still nearby and available", async () => {
    const f = fixture()
    await f.answer()
    expect(f.asker.state.trade).toMatchObject({ with: "recipient", open: true })
    expect(f.recipient.state.trade).toMatchObject({ with: "asker", open: true })
    expect(f.asker.send).toHaveBeenCalledWith(expect.objectContaining({ type: "trade-view" }))
    expect(f.recipient.send).toHaveBeenCalledWith(expect.objectContaining({ type: "trade-view" }))
  })

  it.each(["asker", "recipient"] satisfies Array<"asker" | "recipient">)("rejects when %s has walked away since the request", async (side) => {
    const f = fixture()
    f[side].state.route = [[30, 30]]
    await f.answer()
    expect(f.asker.state.trade).toBeUndefined()
    expect(f.recipient.state.trade).toBeUndefined()
    for (const socket of [f.asker, f.recipient]) expect(socket.send).toHaveBeenCalledWith({ type: "trade-closed", reason: "TOO_FAR" })
  })

  it.each([
    ["asker", { down: true }],
    ["recipient", { down: true }],
    ["asker", { engaged: "ギュンター" }],
    ["recipient", { engaged: "ギュンター" }],
    ["asker", { closed: true }],
    ["recipient", { closed: true }],
    ["asker", { owner: null }],
    ["recipient", { owner: null }],
  ] satisfies Array<["asker" | "recipient", Partial<Presence>]>)("rejects changed availability on %s: %j", async (side, patch) => {
    const f = fixture()
    Object.assign(f[side].state, patch)
    await f.answer()
    expect(f.asker.state.trade).toBeUndefined()
    expect(f.recipient.state.trade).toBeUndefined()
    expect(f.asker.send).toHaveBeenCalledWith({ type: "trade-closed", reason: "BUSY" })
  })

  it("preserves a newer trade with someone else", async () => {
    const f = fixture()
    const newer = { with: "third", open: true, offer: emptyOffer(), shown: [], locked: true, done: false }
    f.recipient.state.trade = newer
    await f.answer()
    expect(f.asker.state.trade).toBeUndefined()
    expect(f.recipient.state.trade).toBe(newer)
    expect(f.recipient.send).not.toHaveBeenCalled()
  })

  it("ignores an answer to a withdrawn invitation", async () => {
    const f = fixture()
    f.asker.state.trade = undefined
    await f.answer()
    expect(f.recipient.state.trade).toBeUndefined()
    expect(f.recipient.send).not.toHaveBeenCalled()
  })

  it("declines without opening a trade", async () => {
    const f = fixture()
    await f.answer(false)
    expect(f.asker.state.trade).toBeUndefined()
    expect(f.recipient.state.trade).toBeUndefined()
    expect(f.asker.send).toHaveBeenCalledWith({ type: "trade-closed", reason: "DECLINED" })
  })
})

it("saves both independent trade sides and their checked stops before notifying either player", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const f = fixture()
  const askerRoute = f.asker.state.route
  const recipientRoute = f.recipient.state.route
  f.recipient.send.mockRejectedValueOnce(Error("Socket closed"))
  await expect(f.answer()).rejects.toThrow("Socket closed")
  expect(f.asker.state.trade?.session).toBeTruthy()
  expect(f.asker.state.trade?.session).toBe(f.recipient.state.trade?.session)
  expect(f.asker.state.trade?.offer).not.toBe(f.recipient.state.trade?.offer)
  expect(f.asker.state.trade?.shown).not.toBe(f.recipient.state.trade?.shown)
  expect(f.asker.state).toMatchObject({ trade: { open: true, locked: false, done: false }, route: [[10, 10]], since: 1000 })
  expect(f.recipient.state).toMatchObject({ trade: { open: true, locked: false, done: false }, route: [[10, 10]], since: 1000 })
  expect(f.asker.state.route[0]).not.toBe(askerRoute[0])
  expect(f.recipient.state.route[0]).not.toBe(recipientRoute[0])
  expect(f.asker.send).not.toHaveBeenCalled()
})
