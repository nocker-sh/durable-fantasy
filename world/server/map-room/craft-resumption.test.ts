import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "#/world/test/durable-storage"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { handleCraft } from "#/world/server/map-room/handle-craft"
import { STATIONS } from "#/world/town/stations"
import type { Ctx } from "#/world/server/map-room/context"
import type { ServerMessage } from "#/world/protocol"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  vi.spyOn(Math, "random").mockReturnValue(0.5)
  const station = STATIONS.find((entry) => entry.kind === "hearth")!
  const initial = player({ profileComplete: true, gold: 20, bag: bagWith(["cabbage", 2], ["onion", 2], ["firewood", 2]) })
  const store = durableStorage({ ...initialPlayerRecord(), player: initial, location: { world: 1, map: station.map, route: [station.cell], since: 1000, connection: "connection" } }, 8)
  const actors = { current: new Player.class(store.state, {}) }
  // The RPC stub is replaced only at transport resolution; requests use the real durable actor.
  vi.spyOn(Player, "get").mockImplementation(() => actors.current as unknown as ReturnType<typeof Player.get>)
  const send = vi.fn(async (_message: ServerMessage) => {})
  const context = {
    ctx: { connection: { id: "connection", send } },
    key: { world: 1, map: station.map },
    me: { owner: "owner", player: mapPlayer("connection", initial, [...station.cell]), route: [[...station.cell]], since: 1000, said: [], engaged: null },
    save: vi.fn(),
  } as unknown as Ctx
  const message = { type: "craft" as const, seq: 1, station: station.id, recipe: "cabbage-soup" }
  return {
    store,
    context,
    send,
    message,
    get actor() {
      return actors.current
    },
    restart: () => {
      actors.current = new Player.class(store.state, {})
    },
  }
}

it.each([false, true])("a repeated craft request cannot pay or produce twice after restart: lostReply=%s", async (lostReply) => {
  const f = fixture()
  if (lostReply) f.send.mockRejectedValueOnce(new Error("Response lost"))
  if (lostReply) await expect(handleCraft(f.context, f.message)).rejects.toThrow("Response lost")
  else await handleCraft(f.context, f.message)
  expect(f.send.mock.calls[0][0]).toMatchObject({ result: { ok: true, events: [{ type: "crafted" }] } })
  const first = f.send.mock.calls[0][0]
  if (first.type !== "result" || !first.result.ok) throw new Error("Craft did not complete")
  const saved = structuredClone(f.store.saved.get("__void_durable_state"))
  f.restart()
  await handleCraft(f.context, f.message)
  expect(f.store.saved.get("__void_durable_state")).toEqual(saved)
  expect(f.send.mock.calls.at(-1)![0]).toEqual({ type: "result", seq: f.message.seq, result: { ...first.result, events: [] } })
})

it("a failed craft save can retry on the same live actor without consuming twice", async () => {
  const f = fixture()
  const initial = structuredClone(f.store.saved.get("__void_durable_state"))
  f.store.failNextSave()
  await expect(handleCraft(f.context, f.message)).rejects.toThrow("Storage unavailable")
  expect(f.store.saved.get("__void_durable_state")).toEqual(initial)
  expect(f.send).not.toHaveBeenCalled()
  await handleCraft(f.context, f.message)
  const completed = structuredClone(f.store.saved.get("__void_durable_state"))
  await handleCraft(f.context, f.message)
  expect(f.store.saved.get("__void_durable_state")).toEqual(completed)
  expect(f.send.mock.calls[0][0]).toMatchObject({ result: { ok: true, events: [{ type: "crafted" }] } })
  expect(f.send.mock.calls[1][0]).toMatchObject({ result: { ok: true, events: [] } })
})
