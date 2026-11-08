import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { MAX_STAT } from "#/world/core/growth-rules"
import { emptyBag } from "#/world/core/empty-bag"
import type { Stack } from "#/world/core/bag-types"
import type { TradeProposal } from "#/world/core/trade-transaction-types"
import type { PlayerRecord } from "#/world/server/player-record"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const read = (store: ReturnType<typeof durableStorage>) => structuredClone((store.saved.get("__void_durable_state") as { value: PlayerRecord }).value)

for (const item of ITEM_IDS)
  it(`${item}: reciprocal trade retains goods and marks through either participant's failed commit`, async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1000)
    for (const failure of ["remote", "local"] as const) {
      const definition = ITEMS[item]
      const stack: Stack = {
        item,
        count: 1,
        ...(definition.made ? ({ q: 2, by: "エルナ" } as const) : {}),
        ...(definition.tool ? { dur: definition.tool.durability - 1 } : {}),
      }
      const herb: Stack = { item: "herb", count: 1 }
      const base = player()
      // Owned goods, money and carrying strength are local conditions, not crafting or growth routes.
      const ownerInitial = player({ gold: 100, stats: { ...base.stats, str: MAX_STAT }, bag: [stack, ...emptyBag(23)] })
      const peerInitial = player({ gold: 50, stats: { ...base.stats, str: MAX_STAT }, bag: [herb, ...emptyBag(23)] })
      const local = durableStorage({ ...initialPlayerRecord(), player: ownerInitial }, 8)
      const remote = durableStorage({ ...initialPlayerRecord(), player: peerInitial }, 8)
      let owner = new Player.class(local.state, {})
      let peer = new Player.class(remote.state, {})
      vi.spyOn(Player, "get").mockImplementation((id) => {
        expect(id).toBe("trade-peer")
        return peer as unknown as ReturnType<typeof Player.get>
      })
      const proposal: TradeProposal = { id: "exchange", revision: 1, offer: { lots: [{ slot: 0, count: 1 }], gold: 10 }, outgoing: [stack], incoming: [herb], gold: 3 }
      const reciprocal: TradeProposal = { id: "exchange", revision: 1, offer: { lots: [{ slot: 0, count: 1 }], gold: 3 }, outgoing: [herb], incoming: [stack], gold: 10 }
      const beforeStart = structuredClone(local.saved.get("__void_durable_state"))
      const beforePeer = structuredClone(remote.saved.get("__void_durable_state"))
      const started = await owner.beginTrade({ peer: "trade-peer", local: proposal, remote: reciprocal })
      if (definition.kind === "key") {
        expect(started).toEqual({ ok: false, reason: "NOT_TRADABLE" })
        expect(local.saved.get("__void_durable_state")).toEqual(beforeStart)
        expect(remote.saved.get("__void_durable_state")).toEqual(beforePeer)
        continue
      }
      expect(started.ok).toBe(true)
      await owner.alarm()
      const decision = read(local)
      const reservation = read(remote)
      expect(decision.tradeJob?.decision).toBe("committed")
      expect(reservation.trade?.status).toBe("prepared")
      const ownerBefore = structuredClone(local.saved.get("__void_durable_state"))
      const remoteBefore = structuredClone(remote.saved.get("__void_durable_state"))
      ;(failure === "local" ? local : remote).failNextSave()
      await expect(owner.alarm()).rejects.toThrow("Storage unavailable")
      expect(local.saved.get("__void_durable_state")).toEqual(ownerBefore)
      if (failure === "remote") expect(remote.saved.get("__void_durable_state")).toEqual(remoteBefore)
      else expect(read(remote).player).toEqual({ ...peerInitial, bag: [stack, ...emptyBag(23)], gold: 57, revision: peerInitial.revision + 1 })
      expect(local.alarms).toHaveBeenLastCalledWith(6000)
      owner = new Player.class(local.state, {})
      peer = new Player.class(remote.state, {})
      await owner.alarm()
      expect(read(local)).toEqual({
        ...decision,
        player: { ...ownerInitial, bag: [herb, ...emptyBag(23)], gold: 93, revision: ownerInitial.revision + 1 },
        trade: { ...decision.trade!, status: "committed" },
        tradeJob: { ...decision.tradeJob!, finished: true },
        deliveryRevision: decision.deliveryRevision + 1,
      })
      const publications = failure === "local" ? 2 : 1
      expect(read(remote)).toEqual({
        ...reservation,
        player: { ...peerInitial, bag: [stack, ...emptyBag(23)], gold: 57, revision: peerInitial.revision + publications },
        trade: { ...reservation.trade!, status: "committed" },
        deliveryRevision: reservation.deliveryRevision + publications,
      })
      const completedOwner = structuredClone(local.saved.get("__void_durable_state"))
      const completedPeer = structuredClone(remote.saved.get("__void_durable_state"))
      owner = new Player.class(local.state, {})
      await owner.alarm()
      await owner.alarm()
      expect(local.saved.get("__void_durable_state")).toEqual(completedOwner)
      expect(remote.saved.get("__void_durable_state")).toEqual(completedPeer)
    }
  })
