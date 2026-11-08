import { afterEach, expect, it, vi } from "vitest"
import { Nature } from "#/durable-objects/nature"
import { Player } from "#/durable-objects/player"
import { emptyBag } from "#/world/core/empty-bag"
import { NODES } from "#/world/core/gather"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { leftAt } from "#/world/core/nature/left-at"
import { initialNatureRecord } from "#/world/server/initial-nature-record"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { NatureRecord } from "#/world/server/nature-record-types"
import type { PlayerRecord } from "#/world/server/player-record"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { HANDLERS } from "#/world/server/map-room/work"
import type { Ctx } from "#/world/server/map-room/context"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const cases = NODES.flatMap((node) => [true, false].map((accepted) => ({ node, accepted })))
it.each(cases)("$node.id/accepted=$accepted: a lost requester reply cannot suppress the shared resource result", async (scenario) => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  vi.spyOn(Math, "random").mockReturnValue(0)
  vi.spyOn(console, "warn").mockImplementation(() => {})
  const node = scenario.node
  const bag = [...emptyBag()]
  if (node.needsTool) {
    const tool = ITEM_IDS.find((id) => ITEMS[id].tool?.skill === node.skill)
    if (!tool) throw Error(`${node.id}: missing authored gathering tool`)
    bag[0] = { item: tool, count: 1, dur: ITEMS[tool].tool!.durability }
  }
  // Tools, warmth and a position at the authored node are local starting conditions.
  // Exhaustion exercises the native resource return while preserving the player.
  const initial = player({
    profileComplete: true,
    stats: { ...player().stats, str: 20 },
    bag,
    stamina: scenario.accepted ? player().stamina : 0,
    sitting: true,
    hpAt: 1000,
    spAt: 1000,
    fullAt: 1000,
    warmUntil: 61_000,
  })
  const recipientStore = durableStorage({ ...initialPlayerRecord(), player: initial, location: { world: 1, map: node.map, route: [node.cell], since: 1000, connection: "connection" } }, 8)
  const sourceStore = durableStorage(initialNatureRecord(), 1)
  const actors = { recipient: new Player.class(recipientStore.state, {}), source: new Nature.class(sourceStore.state, {}) }
  vi.spyOn(Player, "get").mockImplementation(() => actors.recipient as unknown as ReturnType<typeof Player.get>)
  vi.spyOn(Nature, "get").mockImplementation(() => actors.source as unknown as ReturnType<typeof Nature.get>)
  const send = vi.fn(async (_message: ServerMessage): Promise<void> => {
    throw Error("Requester disconnected")
  })
  let requesterClosed = true
  const peerMessages: ServerMessage[] = []
  // Void broadcasts sequentially and a closed socket can stop later deliveries.
  const broadcast = vi.fn(async (notice: ServerMessage, excluded: readonly string[] = []) => {
    if (requesterClosed && !excluded.includes("connection")) throw Error("Requester socket closed during broadcast")
    peerMessages.push(notice)
  })
  const save = vi.fn()
  const me: Presence = { owner: "owner", player: mapPlayer("connection", initial, [...node.cell]), route: [[...node.cell]], since: 1000, said: [], engaged: null, ready: true }
  const context = { ctx: { connection: { id: "connection", send }, room: { broadcast } }, key: { world: 1, map: node.map }, me, save } as unknown as Ctx
  const message = { type: "gather" as const, seq: 1, node: node.id }
  const failure = await HANDLERS.gather!(context, message).then(
    () => null,
    (error: unknown) => error,
  )
  const source = (sourceStore.saved.get("__void_durable_state") as { value: NatureRecord }).value
  const recipient = (recipientStore.saved.get("__void_durable_state") as { value: PlayerRecord }).value
  const reply = send.mock.calls[0][0]
  if (reply.type !== "result") throw Error("Missing native gathering result")
  expect(reply.result.ok).toBe(scenario.accepted)
  expect(source.jobs.owner.phase).toBe("done")
  const left = node.max - (scenario.accepted ? 1 : 0)
  expect(leftAt(source.nature, node.id, 1000)).toBe(left)
  if (reply.result.ok) {
    expect(recipient.player).toEqual(reply.result.state)
    expect(recipient.player.stamina).toBe(initial.stamina - 1)
    expect(recipient.player.sitting).toBe(false)
    expect(save).toHaveBeenCalledExactlyOnceWith({ sitting: false })
  } else {
    expect(reply.result.reason).toBe("EXHAUSTED")
    expect(recipient.player).toEqual(initial)
    expect(save).not.toHaveBeenCalled()
  }
  expect(peerMessages).toEqual([{ type: "nodes", left: { [node.id]: left } }])
  expect(broadcast).toHaveBeenCalledExactlyOnceWith({ type: "nodes", left: { [node.id]: left } }, ["connection"])
  expect(failure).toBeNull()
  const savedSource = structuredClone(sourceStore.saved.get("__void_durable_state"))
  const savedRecipient = structuredClone(recipientStore.saved.get("__void_durable_state"))
  // A request retried after restarting both real actors must use its saved receipt.
  actors.recipient = new Player.class(recipientStore.state, {})
  actors.source = new Nature.class(sourceStore.state, {})
  requesterClosed = false
  send.mockImplementation(async () => {})
  await HANDLERS.gather!(context, message)
  const repeated = send.mock.calls[1][0]
  expect(repeated).toMatchObject({ type: "result", seq: 1, result: { ok: scenario.accepted } })
  if (repeated.type !== "result") throw Error("Missing replayed gathering result")
  const expected = structuredClone(savedRecipient) as { value: PlayerRecord }
  if (repeated.result.ok) {
    expect(repeated.result.events).toEqual([])
    expected.value.player = { ...expected.value.player, revision: expected.value.player.revision + 1 }
  }
  expect(recipientStore.saved.get("__void_durable_state")).toEqual(expected)
  expect(sourceStore.saved.get("__void_durable_state")).toEqual(savedSource)
  expect(broadcast).toHaveBeenLastCalledWith({ type: "nodes", left: { [node.id]: left } })
  expect(peerMessages).toEqual(Array.from({ length: 2 }, () => ({ type: "nodes", left: { [node.id]: left } })))
  const recovered = structuredClone(recipientStore.saved.get("__void_durable_state"))
  await actors.source.alarm()
  expect(recipientStore.saved.get("__void_durable_state")).toEqual(recovered)
  expect(sourceStore.saved.get("__void_durable_state")).toEqual(savedSource)
})
