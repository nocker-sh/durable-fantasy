import { describe, expect, it, vi } from "vitest"
import { Rooms, type Channel, type RoomSocket } from "./rooms"

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
