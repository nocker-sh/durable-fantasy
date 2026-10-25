import { expect, it, vi } from "vitest"
import { Rooms, type RoomSocket, type Channel } from "./rooms.ts"

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
