import { expect, it } from "vitest"
import { emptyClaims } from "#/world/core/empty-claims"
import { finishInbox } from "#/world/core/finish-inbox"
import { receiveInbox } from "#/world/core/receive-inbox"
import { reserveInbox } from "#/world/core/reserve-inbox"
import { emptyExchange } from "#/world/core/empty-exchange"
import { emptyBag } from "#/world/core/empty-bag"
import { player } from "#/world/test/player"

it("reserves and restores an inbox without mutating its inputs or losing later arrivals", () => {
  const ex = { ...emptyExchange(), inbox: { owner: { gold: 2, items: [{ item: "herb" as const, count: 1 }] } } }
  const delivery = emptyClaims()
  const before = structuredClone({ ex, delivery })
  const reserved = reserveInbox(ex, delivery, "owner")
  expect({ ex, delivery }).toEqual(before)
  expect(reserved.ex.inbox.owner).toBeUndefined()
  const arriving = { ...reserved.ex, inbox: { owner: { gold: 3, items: [{ item: "jelly" as const, count: 2 }] } } }
  const snapshot = structuredClone({ ex: arriving, delivery: reserved.delivery })
  const restored = finishInbox({ ex: arriving, delivery: reserved.delivery, owner: "owner", id: reserved.claim.id, accepted: false })
  expect({ ex: arriving, delivery: reserved.delivery }).toEqual(snapshot)
  expect(restored.ex.inbox.owner).toEqual({
    gold: 5,
    items: [
      { item: "jelly", count: 2 },
      { item: "herb", count: 1 },
    ],
  })
  expect(restored.delivery.claims.owner).toBeUndefined()
  expect(finishInbox({ ex: arriving, delivery: reserved.delivery, owner: "owner", id: reserved.claim.id + 1, accepted: true })).toEqual(snapshot)
})

it("accepts each exact receipt once and rejects changed or stale retransmissions", () => {
  const p = player({ gold: 10, bag: emptyBag() })
  const claim = { id: 1, inbox: { gold: 2, items: [{ item: "potion" as const, count: 1, q: 1 as const }] } }
  const result = receiveInbox({ player: p, previous: null, claim: claim, now: 1 })
  if (!result.ok) throw Error(result.reason)
  expect(result.state.gold).toBe(12)
  expect(result.state.bag[0]).toEqual(claim.inbox.items[0])
  expect(receiveInbox({ player: result.state, previous: result.receipt, claim: claim, now: 2 })).toMatchObject({ ok: true, state: result.state, events: [] })
  expect(receiveInbox({ player: result.state, previous: result.receipt, claim: { ...claim, inbox: { ...claim.inbox, gold: 3 } }, now: 2 })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(receiveInbox({ player: result.state, previous: result.receipt, claim: { ...claim, inbox: { ...claim.inbox, items: [{ ...claim.inbox.items[0], by: "別の作り手" }] } }, now: 2 })).toEqual({
    ok: false,
    reason: "NOT_READY",
  })
  expect(receiveInbox({ player: result.state, previous: { ...result.receipt, id: 2 }, claim: claim, now: 2 })).toEqual({ ok: false, reason: "NOT_READY" })
})
