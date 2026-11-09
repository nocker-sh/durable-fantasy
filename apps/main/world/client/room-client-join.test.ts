import { afterEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { GameSession } from "#/world/client/game-session"
import { RoomClient } from "#/world/client/room-client"
import { ServerMessages } from "#/world/client/server-messages"
import { player } from "#/world/test/player"
import type { GameState } from "#/world/state"

const PLAYER = "11111111-1111-4111-8111-111111111111"

afterEach(() => vi.useRealTimers())

type FakeSocket = { send: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn>; emit: (event: string, value?: unknown) => void }

/** A room client whose directory always answers channel 2 and whose sockets are opened and closed by hand. */
function fixture() {
  vi.useFakeTimers()
  const session = new GameSession()
  session.playerId = PLAYER
  session.arriveAt = [20, 20]
  const sockets: FakeSocket[] = []
  const askChannel = vi.fn(async () => ({ channel: 2, channels: { 2: 1 } }))
  session.rooms.askChannel = askChannel
  session.rooms.standBy = vi.fn()
  session.rooms.open = vi.fn(() => {
    const listeners = new Map<string, ((value?: unknown) => void)[]>()
    const socket: FakeSocket = {
      send: vi.fn(),
      close: vi.fn(),
      emit: (event, value) => {
        for (const listener of listeners.get(event) ?? []) listener(value)
      },
    }
    sockets.push(socket)
    const on = (event: string, listener: (value?: unknown) => void) => {
      listeners.set(event, [...(listeners.get(event) ?? []), listener])
      return () => {}
    }
    return { ...socket, on } as unknown as VoidSocket<"/map/:mapId">
  })
  const update = (patch: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => session.state.set((state) => ({ ...state, ...(typeof patch === "function" ? patch(state) : patch) }))
  const client = new RoomClient({ session, update, getScene: () => null, onServer: vi.fn(), preview: () => null, notify: vi.fn(), setPlayer: vi.fn(), report: vi.fn() })
  const joins = (socket: FakeSocket) => socket.send.mock.calls.filter((call) => call[0].type === "join").length
  const welcome = () =>
    new ServerMessages({
      session,
      update,
      getScene: () => null,
      wayBeside: () => null,
      standBy: vi.fn(),
      setPlayer: vi.fn(),
      maybeReady: vi.fn(),
    } as unknown as ConstructorParameters<typeof ServerMessages>[0]).handle({ type: "snapshot", you: "me", me: player(), players: [] })
  return { session, sockets, askChannel, client, joins, welcome }
}

it("joins again on a new socket when the room never answers the join", async () => {
  const f = fixture()
  await f.client.connect("phanthiet")
  f.sockets[0].emit("open")
  expect(f.joins(f.sockets[0])).toBe(1)
  await vi.advanceTimersByTimeAsync(9_999)
  expect(f.sockets[0].close).not.toHaveBeenCalled()
  await vi.advanceTimersByTimeAsync(1)
  expect(f.sockets[0].close).toHaveBeenCalledOnce()
  expect(f.session.socket).toBeNull()
  expect(f.session.state.get().online).toBe("offline")
  await vi.advanceTimersByTimeAsync(1_000)
  // back into the same channel
  expect(f.askChannel).toHaveBeenLastCalledWith("phanthiet", 2)
  expect(f.sockets).toHaveLength(2)
  f.sockets[1].emit("open")
  expect(f.joins(f.sockets[1])).toBe(1)
  f.client.cancel()
})

it("keeps a socket whose join was answered in time", async () => {
  const f = fixture()
  await f.client.connect("phanthiet")
  f.sockets[0].emit("open")
  await vi.advanceTimersByTimeAsync(5_000)
  f.welcome()
  await vi.advanceTimersByTimeAsync(60_000)
  expect(f.sockets[0].close).not.toHaveBeenCalled()
  expect(f.sockets).toHaveLength(1)
  expect(f.session.socket).not.toBeNull()
})

it("comes back after a join the room closed, waiting longer each time until it is let in", async () => {
  const f = fixture()
  await f.client.connect("phanthiet")
  for (const wait of [1_000, 2_000, 4_000]) {
    const socket = f.sockets.at(-1)!
    socket.emit("open")
    socket.emit("close", { code: 1011 })
    // the socket's own reconnection (every second, for ever) is stopped
    expect(socket.close).toHaveBeenCalledOnce()
    const count = f.sockets.length
    await vi.advanceTimersByTimeAsync(wait - 1)
    expect(f.sockets).toHaveLength(count)
    await vi.advanceTimersByTimeAsync(1)
    expect(f.sockets).toHaveLength(count + 1)
  }
  f.sockets.at(-1)!.emit("open")
  f.welcome()
  expect(f.session.joinTries).toBe(0)
  // let in once: the next failure starts from a second again
  f.sockets.at(-1)!.emit("close", { code: 1006 })
  f.sockets.at(-1)!.emit("open")
  f.sockets.at(-1)!.emit("close", { code: 1011 })
  const count = f.sockets.length
  await vi.advanceTimersByTimeAsync(1_000)
  expect(f.sockets).toHaveLength(count + 1)
  f.client.cancel()
})

it("asks for a reload instead of reconnecting when the room refuses a message checked by this build", async () => {
  const f = fixture()
  await f.client.connect("phanthiet")
  f.sockets[0].emit("open")
  f.welcome()
  f.sockets[0].emit("close", { code: 1007 })
  expect(f.session.state.get().outdated).toBe(true)
  expect(f.session.state.get().online).toBe("offline")
  expect(f.sockets[0].close).toHaveBeenCalledOnce()
  await vi.advanceTimersByTimeAsync(120_000)
  expect(f.sockets).toHaveLength(1)
})

it("leaves a socket that never got through to its own reconnection", async () => {
  const f = fixture()
  await f.client.connect("phanthiet")
  f.sockets[0].emit("close", { code: 1006 })
  expect(f.sockets[0].close).not.toHaveBeenCalled()
  expect(f.session.socket).not.toBeNull()
  await vi.advanceTimersByTimeAsync(60_000)
  expect(f.sockets).toHaveLength(1)
  expect(vi.getTimerCount()).toBe(0)
})

it("forgets a pending try when the map is left", async () => {
  const f = fixture()
  await f.client.connect("phanthiet")
  f.sockets[0].emit("open")
  f.sockets[0].emit("close", { code: 1011 })
  f.client.cancel()
  await vi.advanceTimersByTimeAsync(60_000)
  expect(f.sockets).toHaveLength(1)
  expect(vi.getTimerCount()).toBe(0)
})
