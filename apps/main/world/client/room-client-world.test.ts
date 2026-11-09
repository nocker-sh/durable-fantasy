import { afterEach, expect, it, vi } from "vitest"
import { connect } from "void/ws"
import { GameSession } from "#/world/client/game-session"
import { RoomClient } from "#/world/client/room-client"

vi.mock("void/ws", () => ({ connect: vi.fn() }))

const PLAYER = "11111111-1111-4111-8111-111111111111"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

it("joins the new world's channel instead of reusing a room prefetched in the previous world", async () => {
  const requests: { url: string; resolve: (response: Response) => void }[] = []
  const fetchRoom = vi.fn((url: string) => new Promise<Response>((resolve) => requests.push({ url, resolve })))
  vi.stubGlobal("fetch", fetchRoom)
  const sockets: { close: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; emit: (event: string) => void }[] = []
  vi.mocked(connect).mockImplementation(() => {
    const listeners = new Map<string, (() => void)[]>()
    const socket = {
      close: vi.fn(),
      send: vi.fn(),
      on: (event: string, listener: () => void) => listeners.set(event, [...(listeners.get(event) ?? []), listener]),
      emit: (event: string) => {
        for (const listener of listeners.get(event) ?? []) listener()
      },
    }
    sockets.push(socket)
    return socket as unknown as ReturnType<typeof connect>
  })
  const session = new GameSession()
  session.playerId = PLAYER
  const target: ConstructorParameters<typeof RoomClient>[0] = {
    session,
    update: (patch) => session.state.set((state) => ({ ...state, ...(typeof patch === "function" ? patch(state) : patch) })),
    getScene: () => null,
    onServer: vi.fn(),
    preview: () => null,
    notify: vi.fn(),
    setPlayer: vi.fn(),
    report: vi.fn(),
  }
  const client = new RoomClient(target)
  session.rooms.standBy("phanthiet")
  expect(requests[0].url).toBe("/api/channel?world=1&map=phanthiet")
  requests[0].resolve(new Response(JSON.stringify({ channel: 7, channels: { 7: 1 } })))
  await vi.waitFor(() => expect(sockets).toHaveLength(1))
  sockets[0].emit("open")

  session.rooms.world = 2
  const joining = client.connect("phanthiet")
  expect(fetchRoom).toHaveBeenLastCalledWith("/api/channel?world=2&map=phanthiet", { signal: expect.any(AbortSignal) })
  expect(sockets[0].close).toHaveBeenCalledOnce()
  requests[1].resolve(new Response(JSON.stringify({ channel: 3, channels: { 3: 1 } })))
  await joining
  expect(connect).toHaveBeenLastCalledWith("/map/:mapId", { params: { mapId: "2~phanthiet~3" } })
  expect(session.state.get().room).toEqual({ world: 2, channel: 3, channels: { 3: 1 } })
  session.arriveAt = [20, 20]
  sockets[1].emit("open")
  expect(sockets[1].send).toHaveBeenCalledExactlyOnceWith({ type: "join", player: PLAYER, at: [20, 20] })
  expect(sockets[0].send).not.toHaveBeenCalled()
  // the join's wait for an answer ends with the map
  client.cancel()
})
