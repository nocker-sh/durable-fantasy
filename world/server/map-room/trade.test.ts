import { describe, expect, it, vi } from "vitest"
import type { WebSocketConnection } from "void/ws"
import type { ServerMessage } from "#/world/protocol"
import type { Ctx } from "./context"
import { emptyOffer } from "#/world/core/empty-offer"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { setPresence } from "#/world/server/map-room/set-presence"
import type { Presence } from "#/world/server/map-room/presence"
import { player } from "#/world/test/player"

vi.mock("../../../durable-objects/player", () => ({
  Player: {
    get: vi.fn(() => {
      throw new Error("Invitation must not mutate inventory")
    }),
  },
}))
import { HANDLERS } from "./trade"

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
    HANDLERS["trade-answer"]!(
      {
        ctx: { connection: recipient, room: { getConnection: (id: string) => (id === asker.id ? asker : undefined) } },
        me: recipient.state,
        save: (patch: Partial<Presence>) => setPresence(recipient as unknown as WebSocketConnection<ServerMessage>, patch),
      } as unknown as Ctx,
      { type: "trade-answer", from: asker.id, yes },
    )
  return { asker, recipient, answer }
}

describe("trade invitation acceptance", () => {
  it("opens a mutual trade when both players are still nearby and available", async () => {
    const { asker, recipient, answer } = fixture()
    await answer()
    expect(asker.state.trade).toMatchObject({ with: "recipient", open: true })
    expect(recipient.state.trade).toMatchObject({ with: "asker", open: true })
    expect(asker.send).toHaveBeenCalledWith(expect.objectContaining({ type: "trade-view" }))
    expect(recipient.send).toHaveBeenCalledWith(expect.objectContaining({ type: "trade-view" }))
  })

  it.each(["asker", "recipient"] as const)("rejects when %s has walked away since the request", async (side) => {
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
  ] as const)("rejects changed availability on %s: %j", async (side, patch) => {
    const f = fixture()
    Object.assign(f[side].state, patch)
    await f.answer()
    expect(f.asker.state.trade).toBeUndefined()
    expect(f.recipient.state.trade).toBeUndefined()
    expect(f.asker.send).toHaveBeenCalledWith({ type: "trade-closed", reason: "BUSY" })
  })

  it("preserves a newer trade with someone else", async () => {
    const { asker, recipient, answer } = fixture()
    const newer = { with: "third", open: true, offer: emptyOffer(), shown: [], locked: true, done: false }
    recipient.state.trade = newer
    await answer()
    expect(asker.state.trade).toBeUndefined()
    expect(recipient.state.trade).toBe(newer)
    expect(recipient.send).not.toHaveBeenCalled()
  })

  it("ignores an answer to a withdrawn invitation", async () => {
    const { asker, recipient, answer } = fixture()
    asker.state.trade = undefined
    await answer()
    expect(recipient.state.trade).toBeUndefined()
    expect(recipient.send).not.toHaveBeenCalled()
  })

  it("declines without opening a trade", async () => {
    const { asker, recipient, answer } = fixture()
    await answer(false)
    expect(asker.state.trade).toBeUndefined()
    expect(recipient.state.trade).toBeUndefined()
    expect(asker.send).toHaveBeenCalledWith({ type: "trade-closed", reason: "DECLINED" })
  })
})
