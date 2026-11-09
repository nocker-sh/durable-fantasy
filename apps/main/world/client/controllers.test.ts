import { PlayerActions } from "#/world/client/player-actions"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import type { GameState } from "#/world/state"
import type { MapScene } from "#/world/scene/runtime/scene"
import { player } from "#/world/test/player"
import { ServerMessages } from "#/world/client/server-messages"
import { RoomClient } from "#/world/client/room-client"
import { GameSession } from "#/world/client/game-session"
import { createSessionContext } from "#/world/client/create-session-context"
import { DialogueActions } from "#/world/client/dialogue"
import { SocialActions } from "#/world/client/social"
import { STORAGE_KEEPER } from "#/world/core/storage/rules"
import { REASON_TEXT } from "#/world/core/commands"
import { remoteAvatar } from "#/world/client/remote-avatar"

function fixture() {
  const session = new GameSession()
  // the room only takes a join from a player id it can read (core/identity.ts)
  session.playerId = "11111111-1111-4111-8111-111111111111"
  session.state.set({ ...session.state.get(), online: "online" })
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  const freeze = vi.fn()
  const update = (patch: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => session.state.set((state) => ({ ...state, ...(typeof patch === "function" ? patch(state) : patch) }))
  let client: RoomClient
  const callbacks: Parameters<typeof createSessionContext>[1] = {
    getScene: () => ({ freeze, clearRemotes: vi.fn(), stop: vi.fn() }) as unknown as MapScene,
    preview: vi.fn(() => null),
    onServer: vi.fn(),
    wayBeside: () => null,
    standBy: vi.fn(),
    avatarOf: remoteAvatar,
    setPlayer: vi.fn((player) => update({ player })),
    maybeReady: vi.fn(),
    report: vi.fn(),
    connect: async () => {},
    visitTown: vi.fn(),
    update,
    run: (command, send) => client.run(command, send),
    notify: vi.fn(),
    addChat: vi.fn(),
    toggleWindow: vi.fn(),
    lookAtShop: vi.fn(),
    enterMap: vi.fn(),
  }
  const context = createSessionContext(session, callbacks)
  callbacks.update({ online: "online" })
  session.others.welcome("test-connection", [])
  client = new RoomClient(context)
  return { session, context, callbacks, client, send, freeze }
}

afterEach(() => vi.useRealTimers())

describe("client controllers", () => {
  it("settles an interrupted save immediately and does not queue a duplicate", async () => {
    const parts1 = fixture()
    const session = parts1.session,
      client = parts1.client,
      send = parts1.send
    const listeners = new Map<string, (event: { code: number }) => void>()
    const socket = {
      send,
      close: vi.fn(),
      on: (event: string, callback: (event: { code: number }) => void) => {
        listeners.set(event, callback)
        return () => {}
      },
    } as unknown as VoidSocket<"/map/:mapId">
    session.socket = socket
    client.listen(socket)
    session.engaged = "resident"
    session.state.set((state) => ({ ...state, storage: true, tradeAsk: { from: "other", name: "Other" } }))
    const pending = client.run({ type: "use", slot: 0 })
    expect(await client.run({ type: "use", slot: 0 })).toBe(false)
    expect(send).toHaveBeenCalledTimes(1)
    listeners.get("close")!({ code: 1006 })
    expect(await pending).toBe(false)
    expect(session.waiting.size).toBe(0)
    expect(session.state.get().busy).toBe(false)
    expect(session.state.get().online).toBe("offline")
    expect(session.state.get().tradeAsk).toBeNull()
    expect(session.state.get().storage).toBe(false)
    expect(session.engaged).toBeNull()
  })

  it("does not open a late channel response after leaving the game", async () => {
    const parts2 = fixture()
    const session = parts2.session,
      client = parts2.client
    let finish!: (value: { channel: number; channels: Record<number, number> }) => void
    session.rooms.askChannel = () =>
      new Promise((resolve) => {
        finish = resolve
      })
    session.rooms.open = vi.fn()
    const connecting = client.connect("phanthiet")
    client.cancel()
    finish({ channel: 1, channels: {} })
    await connecting
    expect(session.rooms.open).not.toHaveBeenCalled()
  })
  it("does not send commands while disconnected or before the join snapshot", async () => {
    const parts3 = fixture()
    const session = parts3.session,
      client = parts3.client,
      callbacks = parts3.callbacks,
      send = parts3.send
    callbacks.update({ online: "offline" })
    expect(await client.run({ type: "use", slot: 0 })).toBe(false)
    callbacks.update({ online: "online" })
    session.others.clear()
    expect(await client.run({ type: "use", slot: 0 })).toBe(false)
    expect(send).not.toHaveBeenCalled()
    expect(session.waiting.size).toBe(0)
  })

  it("rejects invalid profiles and normalizes names before transmission", async () => {
    const parts4 = fixture()
    const session = parts4.session,
      client = parts4.client,
      send = parts4.send
    const profile = { type: "profile" as const, name: "\u202Ehidden", look: 0, neck: "muffler" as const, neckRamp: "cRed" as const }
    expect(await client.run(profile)).toBe(false)
    expect(send).not.toHaveBeenCalled()
    const saved = client.run({ ...profile, name: "  A\u0308nne  " })
    expect(send).toHaveBeenCalledWith({ type: "command", seq: 1, command: { ...profile, name: "Änne" } })
    session.waiting.get(1)!({ ok: false, reason: "OFFLINE" })
    session.waiting.clear()
    expect(await saved).toBe(false)
  })
  it("keeps session references live when sockets and channel selections change", () => {
    const parts5 = fixture()
    const session = parts5.session,
      context = parts5.context
    session.socket = null
    expect(context.session.socket).toBeNull()
    context.session.wantChannel = 4
    expect(session.wantChannel).toBe(4)
    context.session.warping = true
    expect(session.warping).toBe(true)
  })

  it("correlates a command with its reply, applies the player and clears busy state", async () => {
    vi.useFakeTimers()
    const parts6 = fixture()
    const session = parts6.session,
      client = parts6.client,
      callbacks = parts6.callbacks,
      send = parts6.send
    const result = client.run({ type: "use", slot: 0 })
    expect(session.state.get().busy).toBe(true)
    expect(send).toHaveBeenCalledWith({ type: "command", seq: 1, command: { type: "use", slot: 0 } })
    const next = player()
    session.waiting.get(1)!({ ok: true, state: next, events: [] })
    session.waiting.delete(1)
    expect(await result).toBe(true)
    expect(callbacks.setPlayer).toHaveBeenCalledWith(next)
    expect(session.state.get().busy).toBe(false)
  })

  it("refuses at once a request the room's schema would refuse, instead of waiting it out", async () => {
    vi.useFakeTimers()
    const f = fixture()
    const sent = f.client.run({ type: "use", slot: 0 }, () => false)
    expect(await sent).toBe(false)
    expect(f.callbacks.notify).toHaveBeenCalledExactlyOnceWith(REASON_TEXT.NOT_READY, "bad")
    expect(f.session.waiting.size).toBe(0)
    expect(f.session.state.get().busy).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("times out a missing reply and leaves the client ready for another command", async () => {
    vi.useFakeTimers()
    const parts7 = fixture()
    const session = parts7.session,
      client = parts7.client,
      callbacks = parts7.callbacks
    const result = client.run({ type: "use", slot: 0 })
    await vi.advanceTimersByTimeAsync(8000)
    expect(await result).toBe(false)
    expect(session.waiting.size).toBe(0)
    expect(session.state.get().busy).toBe(false)
    expect(callbacks.notify).toHaveBeenCalled()
  })

  it("releases completed command timers and rejects another command while busy", async () => {
    vi.useFakeTimers()
    const parts8 = fixture()
    const session = parts8.session,
      client = parts8.client
    const first = client.run({ type: "use", slot: 0 })
    const second = client.run({ type: "use", slot: 1 })
    expect(await second).toBe(false)
    expect(vi.getTimerCount()).toBe(1)
    expect(session.state.get().busy).toBe(true)
    session.waiting.get(1)!({ ok: true, state: player(), events: [] })
    expect(await first).toBe(true)
    expect(session.state.get().busy).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("fails pending commands immediately on disconnect and does not buffer new commands", async () => {
    vi.useFakeTimers()
    const parts9 = fixture()
    const session = parts9.session,
      client = parts9.client,
      send = parts9.send
    const listeners = new Map<string, (event: { code: number }) => void>()
    session.socket = { send, on: (event: string, handler: (event: { code: number }) => void) => listeners.set(event, handler) } as unknown as VoidSocket<"/map/:mapId">
    client.listen(session.socket)
    const first = client.run({ type: "use", slot: 0 })
    const second = client.run({ type: "use", slot: 1 })
    listeners.get("close")!({ code: 1006 })
    expect(await first).toBe(false)
    expect(await second).toBe(false)
    expect(session.waiting.size).toBe(0)
    expect(session.state.get().busy).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
    expect(await client.run({ type: "use", slot: 0 })).toBe(false)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it("cleans up when sending throws and ignores a reply from a room just left", async () => {
    vi.useFakeTimers()
    const parts10 = fixture()
    const session = parts10.session,
      client = parts10.client,
      send = parts10.send,
      callbacks = parts10.callbacks
    send.mockImplementationOnce(() => {
      throw new Error("closed")
    })
    expect(await client.run({ type: "use", slot: 0 })).toBe(false)
    expect(session.waiting.size).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
    expect(session.state.get().busy).toBe(false)
    const result = client.run({ type: "use", slot: 0 })
    session.waiting.get(2)!({ ok: true, state: player(), events: [] })
    session.socket = null
    expect(await result).toBe(false)
    expect(callbacks.setPlayer).not.toHaveBeenCalled()
  })

  it("connects using a prefetch taken before its channel request finishes", async () => {
    const parts11 = fixture()
    const session = parts11.session,
      client = parts11.client,
      send = parts11.send,
      callbacks = parts11.callbacks
    let choose!: (value: { channel: number; channels: Record<number, number> }) => void
    vi.spyOn(session.rooms, "askChannel").mockReturnValue(
      new Promise((resolve) => {
        choose = resolve
      }),
    )
    const listeners = new Map<string, () => void>()
    const socket = { send, on: (event: string, handler: () => void) => listeners.set(event, handler), close: vi.fn() }
    vi.spyOn(session.rooms, "open").mockReturnValue(socket as unknown as VoidSocket<"/map/:mapId">)
    session.others.clear()
    session.arriveAt = [1, 2]
    session.rooms.standBy("phanthiet")
    const connecting = client.connect("phanthiet")
    choose({ channel: 2, channels: { 2: 1 } })
    await connecting
    expect(session.socket).toBe(socket)
    listeners.get("open")!()
    expect(session.state.get().online).toBe("online")
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: "join", at: [1, 2] }))
    expect(callbacks.onServer).not.toHaveBeenCalled()
    // the join's wait for an answer ends with the map
    client.cancel()
  })

  it("opens storage from a conversation and updates the scene and server together", () => {
    const parts12 = fixture()
    const session = parts12.session,
      context = parts12.context,
      callbacks = parts12.callbacks,
      send = parts12.send,
      freeze = parts12.freeze
    callbacks.update({ dialogue: { resident: 0, name: STORAGE_KEEPER, job: "倉庫", pages: ["どうぞ"], page: 0, shownAt: 0, choices: [{ label: "預ける", action: "storage" }] } })
    new DialogueActions(context).choose(0)
    expect(session.state.get().dialogue).toBeNull()
    expect(session.state.get().storage).toBe(true)
    expect(session.engaged).toBe(STORAGE_KEEPER)
    expect(freeze).toHaveBeenCalledWith(true)
    expect(send).toHaveBeenCalledWith({ type: "engage", npc: STORAGE_KEEPER })
    expect(callbacks.toggleWindow).toHaveBeenCalledWith("inventory")
  })

  it.each(["shop", "commission"] as const)("does not open a stale %s choice after the keeper goes off duty", (action) => {
    const parts13 = fixture()
    const session = parts13.session,
      context = parts13.context,
      callbacks = parts13.callbacks,
      send = parts13.send
    const dialogue = { resident: 0, name: "ベネディクト", job: "修道士", pages: ["どうぞ"], page: 0, shownAt: -100000, choices: [{ label: "頼む", action }] }
    callbacks.update({ clock: { ...session.state.get().clock, min: 8 * 60 }, dialogue })
    new DialogueActions(context).choose(0)
    expect(session.state.get().shop).toBeNull()
    expect(session.state.get().commission).toBeNull()
    expect(send).not.toHaveBeenCalled()
    expect(callbacks.toggleWindow).not.toHaveBeenCalled()
    // the conversation stays, says why nothing opened, and offers only what the keeper does at this hour
    expect(callbacks.addChat).toHaveBeenCalledWith({ channel: "system", text: "いまは店を開けていない。" })
    expect(session.state.get().dialogue?.name).toBe(dialogue.name)
    expect(session.state.get().dialogue?.choices.some((choice) => choice.action === action)).toBe(false)
  })

  it("sends trade requests through the current socket", () => {
    const parts14 = fixture()
    const context = parts14.context,
      send = parts14.send
    new SocialActions(context).askTrade("other-player")
    expect(send).toHaveBeenCalledWith({ type: "trade-ask", target: "other-player" })
  })
})

it("acknowledges a successful delayed command without reverting a newer state or replaying its events", async () => {
  const parts15 = fixture()
  const session = parts15.session,
    client = parts15.client,
    callbacks = parts15.callbacks
  callbacks.update({ player: player({ revision: 1, sitting: true }) })
  const pending = client.run({ type: "stand" })
  const newer = player({ revision: 3, sitting: true, gold: 5 })
  callbacks.update({ player: newer })
  session.waiting.get(1)!({ ok: true, state: player({ revision: 2, sitting: false, gold: 10 }), events: [{ type: "stood" }] })
  expect(await pending).toBe(true)
  expect(session.state.get().player).toEqual(newer)
  expect(callbacks.setPlayer).not.toHaveBeenCalled()
  expect(callbacks.report).not.toHaveBeenCalled()
  expect(session.waiting.size).toBe(0)
  expect(session.state.get().busy).toBe(false)
})

it("resets creature publication scope when connecting to another channel", () => {
  const parts16 = fixture()
  const session = parts16.session,
    client = parts16.client,
    context = parts16.context
  session.wild = { first: { hp: 0, back: 5000, revision: 100 } }
  const socket = { on: vi.fn(() => () => {}) } as unknown as VoidSocket<"/map/:mapId">
  session.socket = socket
  client.listen(socket)
  expect(session.wild).toEqual({})
  context.getScene = () => null
  new ServerMessages(context).handle({ type: "wild", revision: 1, monsters: { first: { hp: 20, back: 0 } } })
  expect(session.wild.first).toEqual({ hp: 20, back: 0, revision: 1 })
})

it.each([0, 1390, null])("joins using the current dev clock, including midnight and a return to real time: %s", (minute) => {
  const parts17 = fixture()
  const session = parts17.session,
    client = parts17.client,
    send = parts17.send
  session.others.clear()
  session.arriveAt = [1, 2]
  session.state.set({ ...session.state.get(), clock: { min: minute ?? 720, held: minute !== null } })
  client.join()
  const message = send.mock.calls[0][0]
  expect(message.type).toBe("join")
  if (minute === null) expect(message).not.toHaveProperty("time")
  else expect(message.time).toBe(minute)
})

for (const operation of ["place", "cancel", "claim"] as const)
  for (const accepted of [true, false])
    for (const change of ["closed", "symbol", "reopened", "unchanged", "room"] as const)
      it(`${operation}, accepted=${accepted}: a late reply preserves the ${change} exchange window`, async () => {
        const parts18 = fixture()
        const session = parts18.session,
          client = parts18.client,
          context = parts18.context,
          callbacks = parts18.callbacks,
          send = parts18.send
        const actions = new PlayerActions(context)
        const initial = player({ revision: 1, gold: 200 })
        callbacks.update({ player: initial })
        actions.openBoard("log")
        send.mockClear()
        const pending = operation === "place" ? actions.placeOrder({ side: "buy", price: 1, qty: 1 }) : operation === "cancel" ? actions.cancelOrder("local-order") : actions.claimInbox()
        expect(session.state.get().busy).toBe(true)
        expect(session.waiting.size).toBe(1)
        const seq = [...session.waiting.keys()][0]
        expect(send.mock.calls[0][0]).toMatchObject({ type: operation === "place" ? "ex-place" : operation === "cancel" ? "ex-cancel" : "ex-claim", seq })
        if (change === "closed") actions.closeBoard()
        if (change === "symbol") actions.openBoard("stone")
        if (change === "reopened") {
          actions.closeBoard()
          actions.openBoard("log")
        }
        const board = session.state.get().board
        send.mockClear()
        const reply = player({ revision: 2, gold: 190 })
        new ServerMessages(context).handle({ type: "result", seq, result: accepted ? { ok: true, state: reply, events: [] } : { ok: false, reason: "OFFLINE" } })
        // A reply can settle just before leaving; the awaiting continuation runs
        // after the replacement room has installed its own socket and board.
        const nextSend = vi.fn()
        if (change === "room") session.socket = { send: nextSend } as unknown as VoidSocket<"/map/:mapId">
        await pending
        expect(session.waiting.size).toBe(0)
        expect(session.state.get().busy).toBe(false)
        expect(session.state.get().board).toEqual(board)
        expect(session.state.get().player).toEqual(accepted && change !== "room" ? reply : initial)
        expect(
          send.mock.calls.map((entry19) => {
            const message = entry19[0]
            return message
          }),
        ).toEqual(board && change !== "room" ? [{ type: "ex-look", symbol: board.symbol }] : [])
        expect(nextSend).not.toHaveBeenCalled()
        client.cancel()
      })

for (const operation of ["place", "cancel", "claim"] as const)
  it(`${operation}: disconnecting while the exchange waits leaves it closed`, async () => {
    const parts20 = fixture()
    const session = parts20.session,
      client = parts20.client,
      context = parts20.context,
      callbacks = parts20.callbacks,
      send = parts20.send
    let closed!: (event: { code: number }) => void
    const socket = {
      send,
      on: (event: string, listener: (event: { code: number }) => void) => {
        if (event === "close") closed = listener
      },
    } as unknown as VoidSocket<"/map/:mapId">
    session.socket = socket
    client.listen(socket)
    const initial = player({ revision: 1, gold: 200 })
    callbacks.update({ player: initial })
    const actions = new PlayerActions(context)
    actions.openBoard("log")
    const pending = operation === "place" ? actions.placeOrder({ side: "buy", price: 1, qty: 1 }) : operation === "cancel" ? actions.cancelOrder("local-order") : actions.claimInbox()
    expect(session.waiting.size).toBe(1)
    send.mockClear()
    closed({ code: 1006 })
    await pending
    expect(session.state.get().online).toBe("offline")
    expect(session.state.get().board).toBeNull()
    expect(session.state.get().player).toEqual(initial)
    expect(session.state.get().busy).toBe(false)
    expect(session.waiting.size).toBe(0)
    expect(send).not.toHaveBeenCalled()
  })

it("looks at the party again when an invite comes back as not the leader, so a party that broke up shows as gone", () => {
  const parts21 = fixture()
  const session = parts21.session,
    context = parts21.context
  const send = vi.fn()
  session.socket = { send, readyState: 1 } as unknown as VoidSocket<"/map/:mapId">
  context.getScene = () => null
  new ServerMessages(context).handle({ type: "party-closed", reason: "NOT_LEADER" })
  expect(send.mock.calls.map((call) => JSON.stringify(call[0]))).toContainEqual(expect.stringContaining("party-look"))
})
