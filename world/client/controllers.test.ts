import { afterEach, describe, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import type { GameState } from "../state.ts"
import type { MapScene } from "../scene/index.ts"
import { player } from "../test/helpers.ts"
import { RoomClient } from "./room-client.ts"
import { GameSession, createSessionContext } from "./session.ts"
import { DialogueActions } from "./dialogue.ts"
import { SocialActions } from "./social.ts"
import { STORAGE_KEEPER } from "../core/storage.ts"
import { remoteAvatar } from "./identity.ts"

function fixture() {
  const session = new GameSession()
  session.state.set({ ...session.state.get(), online: "online" })
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  const freeze = vi.fn()
  const update = (patch: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => session.state.set((state) => ({ ...state, ...(typeof patch === "function" ? patch(state) : patch) }))
  let client: RoomClient
  const callbacks: Parameters<typeof createSessionContext>[1] = {
    getScene: () => ({ freeze, clearRemotes: vi.fn() }) as unknown as MapScene,
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
  client = new RoomClient(context)
  return { session, context, callbacks, client, send, freeze }
}

afterEach(() => vi.useRealTimers())

describe("client controllers", () => {
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

  it("releases completed command timers and keeps busy until all replies arrive", async () => {
    vi.useFakeTimers()
    const { session, client } = fixture()
    const first = client.run({ type: "use", slot: 0 })
    const second = client.run({ type: "use", slot: 1 })
    expect(vi.getTimerCount()).toBe(2)
    session.waiting.get(1)!({ ok: true, state: player(), events: [] })
    expect(await first).toBe(true)
    expect(session.state.get().busy).toBe(true)
    expect(vi.getTimerCount()).toBe(1)
    session.waiting.get(2)!({ ok: true, state: player(), events: [] })
    expect(await second).toBe(true)
    expect(session.state.get().busy).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("fails pending commands immediately on disconnect and does not buffer new commands", async () => {
    vi.useFakeTimers()
    const { session, client, send } = fixture()
    const listeners = new Map<string, () => void>()
    session.socket = { send, on: (event: string, handler: () => void) => listeners.set(event, handler) } as unknown as VoidSocket<"/map/:mapId">
    client.listen(session.socket)
    const first = client.run({ type: "use", slot: 0 })
    const second = client.run({ type: "use", slot: 1 })
    listeners.get("close")!()
    expect(await first).toBe(false)
    expect(await second).toBe(false)
    expect(session.waiting.size).toBe(0)
    expect(session.state.get().busy).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
    expect(await client.run({ type: "use", slot: 0 })).toBe(false)
    expect(send).toHaveBeenCalledTimes(2)
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

  it("sends trade requests through the current socket", () => {
    const { context, send } = fixture()
    new SocialActions(context).askTrade("other-player")
    expect(send).toHaveBeenCalledWith({ type: "trade-ask", target: "other-player" })
  })
})
