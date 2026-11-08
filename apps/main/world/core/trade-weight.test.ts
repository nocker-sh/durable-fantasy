import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { checkTrade } from "#/world/core/check-trade"
import { countItem } from "#/world/core/count-item"
import { derive } from "#/world/core/derive"
import { finishTrade } from "#/world/core/finish-trade"
import { carried } from "#/world/core/inventory-weight"
import { prepareTrade } from "#/world/core/prepare-trade"
import type { TradeProposal } from "#/world/core/trade-transaction-types"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

it.each([1, 8, 9])("checks the whole trade's weight after removing a strength charm (receiving %i herbs for one log)", (count) => {
  const equipped = player({ bag: bagWith(["log", 255]), equipment: { ...player().equipment, accessory1: "fang-charm" } })
  expect(carried(equipped)).toBeLessThanOrEqual(derive(equipped).maxWeight)
  const removed = apply(equipped, { type: "unequip", slot: "accessory1" })
  if (!removed.ok) throw Error(removed.reason)
  const overloaded = removed.state
  expect(carried(overloaded)).toBeGreaterThan(derive(overloaded).maxWeight)
  const other = player({ bag: bagWith(["herb", count]) })
  const proposal: TradeProposal = {
    id: "lighter-trade",
    revision: 1,
    offer: { lots: [{ slot: 0, count: 1 }], gold: 0 },
    outgoing: [{ item: "log", count: 1 }],
    incoming: [{ item: "herb", count }],
    gold: 0,
  }
  const offer = { lots: [{ slot: 0, count }], gold: 0 }
  const before = structuredClone(overloaded)
  const reason = count > 8 ? "TOO_HEAVY" : null
  expect(checkTrade({ playerA: overloaded, offerA: proposal.offer, playerB: other, offerB: offer, now: 100 })).toBe(reason)
  expect(checkTrade({ playerA: other, offerA: offer, playerB: overloaded, offerB: proposal.offer, now: 100 })).toBe(reason)
  const prepared = prepareTrade({ player: overloaded, previous: null, proposal, now: 100 })
  expect(overloaded).toEqual(before)
  if (count > 8) {
    expect(prepared).toEqual({ ok: false, reason: "TOO_HEAVY" })
    return
  }
  if (!prepared.ok) throw Error(prepared.reason)
  const finished = finishTrade({ player: overloaded, record: prepared.record, id: proposal.id, revision: 1, decision: "committed" })
  if (!finished.ok) throw Error(finished.reason)
  expect(countItem(finished.player.bag, "log")).toBe(254)
  expect(countItem(finished.player.bag, "herb")).toBe(count)
  expect(carried(finished.player)).toBeGreaterThan(derive(finished.player).maxWeight)
  expect(carried(finished.player)).toBeLessThanOrEqual(carried(overloaded))
})
