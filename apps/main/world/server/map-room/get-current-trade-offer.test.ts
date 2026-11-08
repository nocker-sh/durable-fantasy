import { expect, it } from "vitest"
import { emptyOffer } from "#/world/core/empty-offer"
import { getCurrentTradeOffer } from "#/world/server/map-room/get-current-trade-offer"
import type { Presence, TradeSide } from "#/world/server/map-room/presence"

type Props = Parameters<typeof getCurrentTradeOffer>[0]

function participant(withId: string): Presence {
  const trade: TradeSide = { session: "session", with: withId, offerVersion: 3, open: true, offer: emptyOffer(), shown: [], locked: false, done: false }
  return { owner: withId, player: null, route: [], since: 0, said: [], engaged: null, trade }
}

function fixture(): Props {
  return { sender: { id: "sender", presence: participant("recipient") }, recipient: { id: "recipient", presence: participant("sender") }, session: "session", version: 3 }
}

it("returns the current sides without changing them, even when the peer has confirmed", () => {
  const request = fixture()
  const other = request.recipient.presence.trade
  if (!other) throw Error("Missing fixture trade")
  other.locked = true
  other.done = true
  const before = structuredClone(request)
  const current = getCurrentTradeOffer(request)
  expect(current?.mine).toBe(request.sender.presence.trade)
  expect(current?.other).toBe(other)
  expect(request).toEqual(before)
})

it.each(["sender", "recipient"])("rejects a closed or departed %s", (side) => {
  const request = fixture()
  const participant = side === "sender" ? request.sender : request.recipient
  participant.presence.closed = true
  expect(getCurrentTradeOffer(request)).toBeNull()
  participant.presence.closed = false
  participant.presence.trade = undefined
  expect(getCurrentTradeOffer(request)).toBeNull()
})

it.each(["sender", "recipient"])("rejects a replaced, unopened or settling trade on the %s", (side) => {
  for (const patch of [{ session: "later" }, { with: "third" }, { open: false }, { settling: true }]) {
    const request = fixture()
    const participant = side === "sender" ? request.sender : request.recipient
    const trade = participant.presence.trade
    if (!trade) throw Error("Missing fixture trade")
    Object.assign(trade, patch)
    expect(getCurrentTradeOffer(request)).toBeNull()
  }
})

it("rejects stale inventory reads and a sender who has locked the offer", () => {
  const request = fixture()
  expect(getCurrentTradeOffer({ ...request, version: 2 })).toBeNull()
  const mine = request.sender.presence.trade
  if (!mine) throw Error("Missing fixture trade")
  mine.locked = true
  expect(getCurrentTradeOffer(request)).toBeNull()
})
