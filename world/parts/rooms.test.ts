import { describe, expect, it, vi } from "vitest"
import { Rooms, type Channel, type RoomSocket } from "#/world/parts/rooms"

function fixture() {
  const rooms = new Rooms()
  const requests: ((channel: Channel) => void)[] = []
  vi.spyOn(rooms, "askChannel").mockImplementation(() => new Promise((resolve) => requests.push(resolve)))
  const sockets: { close: ReturnType<typeof vi.fn>; emit: (event: string) => void }[] = []
  const open = vi.spyOn(rooms, "open").mockImplementation(() => {
    const listeners = new Map<string, () => void>()
    const socket = { close: vi.fn(), on: (event: string, handler: () => void) => listeners.set(event, handler), emit: (event: string) => listeners.get(event)?.() }
    sockets.push(socket)
    return socket as unknown as RoomSocket
  })
  return { rooms, requests, sockets, open }
}
const channel = { channel: 2, channels: { 2: 1 } }

describe("room preconnection ownership", () => {
  it("finishes a pending channel request after entry takes ownership, without opening twice", async () => {
    const { rooms, requests, open, sockets } = fixture()
    rooms.standBy("forest-edge")
    const ready = rooms.take("forest-edge", null)!
    expect(ready.socket).toBeNull()
    expect(rooms.take("forest-edge", null)).toBeNull()
    requests[0](channel)
    expect(await ready.channel).toEqual(channel)
    expect(open).toHaveBeenCalledExactlyOnceWith("forest-edge", 2)
    expect(ready.socket).toBe(sockets[0])
    sockets[0].emit("open")
    expect(ready.open).toBe(true)
    sockets[0].emit("close")
    expect(ready.open).toBe(false)
  })

  it("cancels abandoned pending preconnections without cancelling a transferred one", async () => {
    const { rooms, requests, open } = fixture()
    rooms.standBy("forest-edge")
    rooms.standBy("deep-forest")
    requests[0](channel)
    await Promise.resolve()
    expect(open).not.toHaveBeenCalled()
    const ready = rooms.take("deep-forest", null)!
    rooms.standBy("forest-edge")
    requests[1](channel)
    await ready.channel
    expect(open).toHaveBeenCalledExactlyOnceWith("deep-forest", 2)
  })

  it.each([null, 3])("closes an unused socket when entering another map or selecting channel %s", async (want) => {
    const { rooms, requests, sockets } = fixture()
    rooms.standBy("forest-edge")
    requests[0](channel)
    await Promise.resolve()
    expect(rooms.take(want ? "forest-edge" : "deep-forest", want)).toBeNull()
    expect(sockets[0].close).toHaveBeenCalledOnce()
  })
})

function pendingRoom() {
  const rooms = new Rooms()
  let resolve!: (channel: Channel) => void
  rooms.askChannel = () =>
    new Promise((done) => {
      resolve = done
    })
  const socket = { on: vi.fn(), close: vi.fn() } as unknown as RoomSocket
  rooms.open = vi.fn(() => socket)
  rooms.standBy("phanthiet-market")
  return { rooms, resolve, socket }
}

it("opens a prefetched room taken before its channel lookup completes", async () => {
  const { rooms, resolve, socket } = pendingRoom()
  const ready = rooms.take("phanthiet-market", null)!
  resolve({ channel: 2, channels: {} })
  await ready.channel
  expect(rooms.open).toHaveBeenCalledWith("phanthiet-market", 2)
  expect(ready.socket).toBe(socket)
})

it("does not open a cancelled prefetch after leaving the game", async () => {
  const { rooms, resolve } = pendingRoom()
  rooms.close()
  resolve({ channel: 2, channels: {} })
  await Promise.resolve()
  expect(rooms.open).not.toHaveBeenCalled()
})

describe("room preconnections across worlds", () => {
  it("closes an opened preconnection when changing worlds", async () => {
    const f = fixture()
    f.rooms.standBy("phanthiet")
    f.requests[0](channel)
    await Promise.resolve()
    f.sockets[0].emit("open")
    f.rooms.world = 2
    expect(f.sockets[0].close).toHaveBeenCalledOnce()
    expect(f.rooms.standingBy("phanthiet")).toBe(false)
    expect(f.rooms.take("phanthiet", null)).toBeNull()
  })

  it("does not open a pending old-world preconnection", async () => {
    const f = fixture()
    f.rooms.standBy("phanthiet")
    f.rooms.world = 2
    f.requests[0](channel)
    await Promise.resolve()
    expect(f.open).not.toHaveBeenCalled()
    expect(f.rooms.take("phanthiet", null)).toBeNull()
  })

  it("invalidates a pending preconnection already taken by its caller", async () => {
    const f = fixture()
    f.rooms.standBy("phanthiet")
    const ready = f.rooms.take("phanthiet", null)!
    f.rooms.world = 2
    f.requests[0](channel)
    expect(await ready.channel).toEqual(channel)
    expect(f.open).not.toHaveBeenCalled()
    expect(ready.socket).toBeNull()
  })

  it("does not revive an old taken preconnection after returning to its world", async () => {
    const f = fixture()
    f.rooms.standBy("phanthiet")
    const old = f.rooms.take("phanthiet", null)!
    f.rooms.world = 2
    f.rooms.world = 1
    f.rooms.standBy("phanthiet")
    const current = f.rooms.take("phanthiet", null)!
    f.requests[0](channel)
    await old.channel
    expect(f.open).not.toHaveBeenCalled()
    f.requests[1](channel)
    await current.channel
    expect(f.open).toHaveBeenCalledExactlyOnceWith("phanthiet", 2)
    expect(current.socket).toBe(f.sockets[0])
    expect(old.socket).toBeNull()
  })

  it("retains pending and opened preconnections when assigning the same world", async () => {
    const f = fixture()
    f.rooms.standBy("phanthiet")
    f.rooms.world = 1
    expect(f.rooms.standingBy("phanthiet")).toBe(true)
    f.requests[0](channel)
    await Promise.resolve()
    f.rooms.world = 1
    const ready = f.rooms.take("phanthiet", null)!
    expect(ready.socket).toBe(f.sockets[0])
    expect(f.sockets[0].close).not.toHaveBeenCalled()
    expect(f.open).toHaveBeenCalledExactlyOnceWith("phanthiet", 2)
  })
})
