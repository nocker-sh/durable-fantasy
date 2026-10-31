import { afterEach, expect, it, vi } from "vitest"
import { handleShopLook } from "#/world/server/map-room/handle-shop-look"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Market } from "#/durable-objects/market"
import type { Player } from "#/durable-objects/player"
import type { npcCell } from "#/world/maps/npc-cell"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"

type MarketRpc = ReturnType<typeof Market.get>
type PlayerRpc = ReturnType<typeof Player.get>
const rpc = vi.hoisted(() => ({
  market: vi.fn(),
  player: vi.fn(),
  look: vi.fn<MarketRpc["look"]>(),
  buying: vi.fn<MarketRpc["buying"]>(),
  read: vi.fn<PlayerRpc["read"]>(),
  npc: vi.fn<typeof npcCell>(),
}))
vi.mock("#/durable-objects/market", () => ({ Market: { get: rpc.market } }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: rpc.player } }))
vi.mock("#/world/maps/npc-cell", () => ({ npcCell: rpc.npc }))
vi.mock("#/world/maps/minutes-to-close", () => ({ minutesToClose: () => 10 }))
afterEach(() => vi.resetAllMocks())

function fixture() {
  const trace: string[] = []
  const me: Presence = { owner: "owner", player: mapPlayer("connection", newPlayer(), [0, 0]), route: [[0, 0]], since: Date.now(), said: [], engaged: null }
  const send = vi.fn(async (_message: ServerMessage) => {
    trace.push("send")
  })
  rpc.npc.mockReturnValue([0, 0])
  rpc.look.mockImplementation(async () => {
    trace.push("look")
    return []
  })
  rpc.read.mockImplementation(async () => {
    trace.push("read")
    return {
      ...newPlayer(),
      bag: [
        { item: "apple", count: 2 },
        { item: "sealed-letter", count: 1 },
        { item: "apple", count: 1 },
      ],
    }
  })
  rpc.buying.mockImplementation(async () => {
    trace.push("buying")
    return { apple: 3 }
  })
  rpc.market.mockReturnValue({ look: rpc.look, buying: rpc.buying })
  rpc.player.mockReturnValue({ read: rpc.read })
  return { me, send, trace, room: { me, map: { id: "map" }, ctx: { connection: { send } } } }
}

it("reads stock before inventory and unique sellable types before replying", async () => {
  const request = fixture()
  await handleShopLook(request.room, { type: "look", shop: "fruit" })
  expect(request.trace).toEqual(["look", "read", "buying", "send"])
  expect(rpc.look).toHaveBeenCalledExactlyOnceWith("fruit", 10)
  expect(rpc.buying).toHaveBeenCalledExactlyOnceWith("fruit", ["apple"])
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "stock", shop: "fruit", offers: [], buys: { apple: 3 } })
})

it("does not query storage for an inherited shop name", async () => {
  const request = fixture()
  await handleShopLook(request.room, { type: "look", shop: "constructor" })
  expect(rpc.npc).not.toHaveBeenCalled()
  expect(rpc.market).not.toHaveBeenCalled()
  expect(rpc.player).not.toHaveBeenCalled()
})

it.each([null, [80, 80]])("does not query storage without a reachable keeper", async (cell) => {
  const request = fixture()
  if (cell === null) rpc.npc.mockReturnValue(null)
  else rpc.npc.mockReturnValue([cell[0], cell[1]])
  await handleShopLook(request.room, { type: "look", shop: "fruit" })
  expect(rpc.market).not.toHaveBeenCalled()
  expect(rpc.player).not.toHaveBeenCalled()
  expect(request.send).not.toHaveBeenCalled()
})

it("does not read another player's inventory when no owner is present", async () => {
  const request = fixture()
  request.me.owner = null
  await handleShopLook(request.room, { type: "look", shop: "fruit" })
  expect(rpc.player).not.toHaveBeenCalled()
  expect(rpc.buying).toHaveBeenCalledExactlyOnceWith("fruit", [])
})

it("propagates inventory failure without querying buy prices or sending incomplete stock", async () => {
  const request = fixture()
  rpc.read.mockRejectedValue(Error("Unavailable"))
  await expect(handleShopLook(request.room, { type: "look", shop: "fruit" })).rejects.toThrow("Unavailable")
  expect(rpc.buying).not.toHaveBeenCalled()
  expect(request.send).not.toHaveBeenCalled()
})
