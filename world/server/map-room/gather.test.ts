import { afterEach, expect, it, vi } from "vitest"
import { Nature } from "#/durable-objects/nature"
import { Player } from "#/durable-objects/player"
import { NODES } from "#/world/core/gather"
import { initialNatureRecord } from "#/world/server/initial-nature-record"
import type { NatureRecord } from "#/world/server/nature-record-types"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Ctx } from "#/world/server/map-room/context"
import type { ServerMessage } from "#/world/protocol"
import { HANDLERS } from "#/world/server/map-room/work"
vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const node = NODES[0],
    p = player({ profileComplete: true })
  const store = durableStorage(initialNatureRecord(), 1)
  const pc = durableStorage({ ...initialPlayerRecord(), player: p, location: { world: 1, map: node.map, route: [node.cell], since: 1000, connection: "connection" } }, 8)
  const actor = new Player.class(pc.state, {})
  const nature = new Nature.class(store.state, {})
  vi.spyOn(Player, "get").mockReturnValue(actor as unknown as ReturnType<typeof Player.get>)
  vi.spyOn(Nature, "get").mockReturnValue(nature as unknown as ReturnType<typeof Nature.get>)
  const send = vi.fn(async (_message: ServerMessage) => {}),
    broadcast = vi.fn(async (_message: ServerMessage) => {})
  const me: Presence = { owner: "owner", player: mapPlayer("connection", p, [...node.cell]), route: [[...node.cell]], since: 1000, said: [], engaged: null, ready: true }
  const context = { ctx: { connection: { id: "connection", send }, room: { broadcast } }, key: { world: 1, map: node.map }, me } as unknown as Ctx
  return { node, store, actor, me, context, send, broadcast }
}
it("routes a gathering attempt through durable reservation, receipt and shared remaining count", async () => {
  const f = fixture()
  const message = { type: "gather" as const, seq: 1, node: f.node.id }
  await HANDLERS.gather!(f.context, message)
  expect(f.send.mock.calls[0][0]).toMatchObject({ type: "result", seq: 1, result: { ok: true, events: [{ type: "gathered" }] } })
  expect(f.broadcast).toHaveBeenCalledExactlyOnceWith({ type: "nodes", left: { [f.node.id]: f.node.max - 1 } })
  const first = await f.actor.read()
  await HANDLERS.gather!(f.context, message)
  expect((await f.actor.read()).bag).toEqual(first.bag)
  expect((f.store.saved.get("__void_durable_state") as { value: NatureRecord }).value.jobs.owner.phase).toBe("done")
})
it.each(["distance", "map"])("refuses an invalid %s before reserving resources", async (failure) => {
  const f = fixture(),
    before = structuredClone(f.store.saved.get("__void_durable_state"))
  if (failure === "distance") f.me.route = [[0, 0]]
  else f.context.key = { ...f.context.key, map: "phanthiet" }
  await HANDLERS.gather!(f.context, { type: "gather", seq: 1, node: f.node.id })
  expect(f.send).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: 1, result: { ok: false, reason: "TOO_FAR" } })
  expect(f.store.saved.get("__void_durable_state")).toEqual(before)
  expect(f.broadcast).not.toHaveBeenCalled()
})
