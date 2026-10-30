import { afterEach, describe, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import type { GameState } from "#/world/state"
import type { MapScene } from "#/world/scene/runtime/scene"
import { player } from "#/world/test/player"
import { ServerMessages } from "./server-messages"
import { RoomClient } from "./room-client"
import { GameSession } from "#/world/client/game-session"
import { createSessionContext } from "#/world/client/create-session-context"
import { DialogueActions } from "./dialogue"
import { SocialActions } from "./social"
import { STORAGE_KEEPER } from "#/world/core/storage/rules"
import { remoteAvatar } from "#/world/client/remote-avatar"

function fixture() {
  const session = new GameSession()
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
    const { session, client, send } = fixture()
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
    const { session, client } = fixture()
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
    const { session, client, callbacks, send } = fixture()
    callbacks.update({ online: "offline" })
    expect(await client.run({ type: "use", slot: 0 })).toBe(false)
    callbacks.update({ online: "online" })
    session.others.clear()
    expect(await client.run({ type: "use", slot: 0 })).toBe(false)
    expect(send).not.toHaveBeenCalled()
    expect(session.waiting.size).toBe(0)
  })

  it("rejects invalid profiles and normalizes names before transmission", async () => {
    const { session, client, send } = fixture()
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
    const { session, context } = fixture()
    session.socket = null
    expect(context.session.socket).toBeNull()
    context.session.wantChannel = 4
    expect(session.wantChannel).toBe(4)
    context.session.warping = true
    expect(session.warping).toBe(true)
  })

  it("correlates a command with its reply, applies the player and clears busy state", async () => {
    vi.useFakeTimers()
    const { session, client, callbacks, send } = fixture()
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

  it("times out a missing reply and leaves the client ready for another command", async () => {
    vi.useFakeTimers()
    const { session, client, callbacks } = fixture()
    const result = client.run({ type: "use", slot: 0 })
    await vi.advanceTimersByTimeAsync(8000)
    expect(await result).toBe(false)
    expect(session.waiting.size).toBe(0)
    expect(session.state.get().busy).toBe(false)
    expect(callbacks.notify).toHaveBeenCalled()
  })

  it("releases completed command timers and rejects another command while busy", async () => {
    vi.useFakeTimers()
    const { session, client } = fixture()
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
    const { session, client, send } = fixture()
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
    const { session, client, send, callbacks } = fixture()
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
    const { session, client, send, callbacks } = fixture()
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
  })

  it("opens storage from a conversation and updates the scene and server together", () => {
    const { session, context, callbacks, send, freeze } = fixture()
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
    const { session, context, callbacks, send } = fixture()
    const dialogue = { resident: 0, name: "ベネディクト", job: "修道士", pages: ["どうぞ"], page: 0, shownAt: -100000, choices: [{ label: "頼む", action }] }
    callbacks.update({ clock: { ...session.state.get().clock, min: 8 * 60 }, dialogue })
    new DialogueActions(context).choose(0)
    expect(session.state.get().shop).toBeNull()
    expect(session.state.get().commission).toBeNull()
    expect(session.state.get().dialogue).toEqual(dialogue)
    expect(send).not.toHaveBeenCalled()
    expect(callbacks.toggleWindow).not.toHaveBeenCalled()
  })

  it("sends trade requests through the current socket", () => {
    const { context, send } = fixture()
    new SocialActions(context).askTrade("other-player")
    expect(send).toHaveBeenCalledWith({ type: "trade-ask", target: "other-player" })
  })
})

it("acknowledges a successful delayed command without reverting a newer state or replaying its events", async () => {
  const { session, client, callbacks } = fixture()
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
  const { session, client, context } = fixture()
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
  const { session, client, send } = fixture()
  session.others.clear()
  session.arriveAt = [1, 2]
  session.state.set({ ...session.state.get(), clock: { min: minute ?? 720, held: minute !== null } })
  client.join()
  const message = send.mock.calls[0][0]
  expect(message.type).toBe("join")
  if (minute === null) expect(message).not.toHaveProperty("time")
  else expect(message.time).toBe(minute)
})
