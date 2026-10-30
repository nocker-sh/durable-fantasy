import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { prepareTrade } from "#/world/core/prepare-trade"
import { emptyBag } from "#/world/core/empty-bag"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => vi.restoreAllMocks())
const location = { world: 1, map: "phanthiet", route: [[38, 80]], since: 1000, connection: "connection" }

it.each([0, 1, 2, 3, 4, 5, 6, 7, 8])("preserves identity, position and existing transactions through envelope version %s", async (version) => {
  const p = player({ gold: 43, bag: bagWith(["herb", 3]) })
  const proposal = { id: "trade", revision: 1, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [], gold: 0 }
  const prepared = prepareTrade({ player: p, previous: null, proposal: proposal, now: 1000 })
  if (!prepared.ok) throw Error(prepared.reason)
  const trade = version >= 1 ? prepared.record : null
  const tradeJob = version >= 2 ? { peer: "peer", local: proposal, remote: proposal, decision: null, finished: false, reason: null } : null
  const exchangeReceipt = version >= 3 ? { id: 7, inbox: { gold: 2, items: [{ item: "herb", count: 1 }] } } : null
  const orderEscrow = version >= 4 ? { id: 8, intent: { side: "buy", symbol: "log", price: 10, qty: 1 } } : null
  const combatPayments = version >= 5 ? { field: { id: 9, art: "lunge", outcome: { ok: true } } } : {}
  const combatReceipts = version >= 6 ? { field: { id: 10, command: { type: "share", exp: 4, monster: "slime" } } } : {}
  const combatRevision = version >= 6 ? 3 : 0
  const shopReceipts = version >= 7 ? { market: { quote: { id: 11, type: "buy", shop: "fruit", item: "apple", count: 2, unitPrice: 5, keepers: ["オットー"] }, outcome: { ok: true } } } : {}
  const gatherReceipts = version >= 8 ? { nature: { request: { id: 12, node: "south-meadow-herbs-1", roll: 0.5 }, outcome: { ok: true } } } : {}
  const combatLife = version >= 6 ? 2 : 0
  const value = {
    player: p,
    credential: "test-credential",
    location,
    ...(version >= 1 ? { trade } : {}),
    ...(version >= 2 ? { tradeJob } : {}),
    ...(version >= 3 ? { exchangeReceipt } : {}),
    ...(version >= 4 ? { orderEscrow } : {}),
    ...(version >= 5 ? { combatPayments } : {}),
    ...(version === 6 ? { combatReceipts, combatRevision, combatLife } : {}),
    ...(version >= 7 ? { combatReceipts, deliveryRevision: combatRevision, combatLife, shopReceipts } : {}),
    ...(version >= 8 ? { gatherReceipts } : {}),
  }
  const f = durableStorage(value, version)
  const actor = new Player.class(f.state, {})
  expect(await actor.authenticate("test-credential")).toBe(true)
  expect(f.saved.get("__void_durable_state")).toEqual({
    __voidDurableState: true,
    version: 8,
    value: {
      player: p,
      credential: "test-credential",
      location,
      trade,
      tradeJob,
      exchangeReceipt,
      orderEscrow,
      combatPayments,
      combatReceipts,
      deliveryRevision: combatRevision,
      combatLife,
      shopReceipts,
      gatherReceipts,
    },
  })
})

it.each([0, 1, 2, 3, 4, 5, 6, 7, 8])("does not overwrite unreadable gameplay data while loading envelope version %s", async (version) => {
  const value = { player: { ...player(), gold: -1 }, credential: "test-credential", location, trade: null, tradeJob: null, exchangeReceipt: null, orderEscrow: null }
  const f = durableStorage(value, version)
  const before = structuredClone(f.saved.get("__void_durable_state"))
  const actor = new Player.class(f.state, {})
  await expect(actor.read()).rejects.toThrow("Saved player data is unreadable")
  expect(f.saved.get("__void_durable_state")).toEqual(before)
})

it.each([null, { ...player(), version: 99 }, { ...player(), bag: [{ item: "unknown-item", count: 1 }, ...emptyBag().slice(1)] }])(
  "refuses inventory mutations on unreadable data without replacing the saved record",
  async (payload) => {
    const f = durableStorage({ player: payload, credential: "test-credential", location, trade: null, tradeJob: null, exchangeReceipt: null, orderEscrow: null }, 4)
    const before = structuredClone(f.saved.get("__void_durable_state"))
    const actor = new Player.class(f.state, {})
    await expect(actor.run({ type: "sit" })).rejects.toThrow("Saved player data is unreadable")
    const proposal = { id: "trade", revision: 1, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [], gold: 0 }
    await expect(actor.beginTrade({ peer: "peer", local: proposal, remote: proposal })).rejects.toThrow("Saved player data is unreadable")
    await expect(actor.prepareTrade(proposal)).rejects.toThrow("Saved player data is unreadable")
    await expect(actor.finishTrade({ id: "trade", revision: 1, decision: "committed" })).rejects.toThrow("Saved player data is unreadable")
    await expect(actor.readCombat()).rejects.toThrow("Saved player data is unreadable")
    await expect(actor.deliveryUpdate(null)).rejects.toThrow("Saved player data is unreadable")
    await expect(actor.receiveCombat("wild", { id: 1, command: { type: "loot", monster: "slime", exp: 1, items: [] } })).rejects.toThrow("Saved player data is unreadable")
    await expect(actor.give("herb", 1)).rejects.toThrow("Saved player data is unreadable")
    await expect(actor.holdOrder(1, { side: "buy", symbol: "log", price: 1, qty: 1 })).rejects.toThrow("Saved player data is unreadable")
    await expect(actor.receiveInbox({ id: 1, inbox: { gold: 1, items: [] } })).rejects.toThrow("Saved player data is unreadable")
    expect(f.saved.get("__void_durable_state")).toEqual(before)
  },
)

it("continues to restore a supported first-format gameplay save", async () => {
  const p = player()
  const legacy = { version: 1, gold: 9, hp: 30, bag: bagWith(["apple", 3]), weapon: "dagger", hotbar: p.hotbar }
  const f = durableStorage({ player: legacy, credential: "test-credential", location }, 0)
  const actor = new Player.class(f.state, {})
  expect(await actor.read()).toMatchObject({ version: 3, gold: 9, bag: legacy.bag, equipment: { weapon: "dagger" }, profileComplete: true })
  expect(await actor.authenticate("test-credential")).toBe(true)
})

it("leaves an incomplete envelope intact when migration cannot identify its player", async () => {
  const f = durableStorage({ credential: "test-credential", location }, 0)
  const before = structuredClone(f.saved.get("__void_durable_state"))
  const actor = new Player.class(f.state, {})
  await expect(actor.read()).rejects.toThrow("Saved player record is unreadable")
  expect(f.saved.get("__void_durable_state")).toEqual(before)
})

it("can retry a failed migration save without losing the previous record", async () => {
  const f = durableStorage({ player: player({ gold: 43, bag: bagWith(["herb", 3]) }), credential: "test-credential", location }, 0)
  const before = structuredClone(f.saved.get("__void_durable_state"))
  f.failNextSave()
  const failed = new Player.class(f.state, {})
  await expect(failed.read()).rejects.toThrow("Storage unavailable")
  expect(f.saved.get("__void_durable_state")).toEqual(before)
  const restored = new Player.class(f.state, {})
  expect(await restored.read()).toMatchObject({ gold: 43, bag: bagWith(["herb", 3]) })
  expect(await restored.authenticate("test-credential")).toBe(true)
})

it("does not ask the other participant to prepare when trade recovery cannot restore its own player", async () => {
  const proposal = { id: "trade", revision: 1, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [], gold: 0 }
  const f = durableStorage(
    {
      player: { ...player(), gold: -1 },
      credential: "test-credential",
      location,
      trade: null,
      tradeJob: { peer: "peer", local: proposal, remote: proposal, decision: null, finished: false, reason: null },
      exchangeReceipt: null,
      orderEscrow: null,
    },
    4,
  )
  const before = structuredClone(f.saved.get("__void_durable_state"))
  const peer = vi.spyOn(Player, "get")
  const actor = new Player.class(f.state, {})
  await expect(actor.alarm()).rejects.toThrow("Saved player data is unreadable")
  expect(peer).not.toHaveBeenCalled()
  expect(f.saved.get("__void_durable_state")).toEqual(before)
})

it("returns the restored gameplay shape even when a dev grant cannot fit in an old save", async () => {
  const bag = emptyBag().map(() => ({ item: "log" as const, count: 99 }))
  const legacy = { version: 1, gold: 9, hp: 30, bag, weapon: "dagger", hotbar: player().hotbar }
  const f = durableStorage({ player: legacy, credential: "test-credential", location }, 0)
  const actor = new Player.class(f.state, {})
  expect(await actor.give("herb", 1)).toMatchObject({ version: 3, gold: 9, bag, equipment: { weapon: "dagger" } })
  expect(await actor.authenticate("test-credential")).toBe(true)
})
