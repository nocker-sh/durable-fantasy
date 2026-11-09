import { expect, it } from "vitest"
import { handableGold } from "#/world/core/handable-gold"
import { apply } from "#/world/core/apply"
import { newPlayer } from "#/world/core/new-player"
import { STARTING_GOLD } from "#/world/core/player-rules"

it("keeps a new character's starting gold from being handed to another player", () => {
  const fresh = newPlayer()
  expect(apply(fresh, { type: "trade-out", offer: { lots: [], gold: 1 } }).ok).toBe(false)
  expect(apply(fresh, { type: "escrow-buy", gold: 1 }).ok).toBe(false)
})

it("lets gold earned on top of it change hands", () => {
  const earned = { ...newPlayer(), gold: STARTING_GOLD + 30 }
  expect(apply(earned, { type: "trade-out", offer: { lots: [], gold: 30 } }).ok).toBe(true)
  expect(apply(earned, { type: "trade-out", offer: { lots: [], gold: 31 } }).ok).toBe(false)
})

it("spends the starting gold first in town, freeing what is earned later", () => {
  const fresh = newPlayer()
  const bought = apply(fresh, { type: "buy", shop: "leather", item: "raw-hide", count: 1 })
  expect(bought.ok).toBe(true)
  if (!bought.ok) return
  expect(bought.state.allowance).toBe(bought.state.gold)
  const paid = { ...bought.state, gold: bought.state.gold + 20 }
  expect(apply(paid, { type: "trade-out", offer: { lots: [], gold: 20 } }).ok).toBe(true)
})

it("lets a refund through the inbox stay handable without the starting gold growing back", () => {
  // earned 50 on top of the starting gold, put it up for a buy order, then got it back
  const earned = { ...newPlayer(), gold: STARTING_GOLD + 50 }
  const escrowed = apply(earned, { type: "escrow-buy", gold: 50 })
  expect(escrowed.ok).toBe(true)
  if (!escrowed.ok) return
  const refunded = apply(escrowed.state, { type: "receive", gold: 50, items: [] })
  expect(refunded.ok).toBe(true)
  if (!refunded.ok) return
  expect(refunded.state.allowance).toBe(STARTING_GOLD)
  expect(handableGold(refunded.state)).toBe(50)
})
