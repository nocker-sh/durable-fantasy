import { expect, it } from "vitest"
import { emptyOffer } from "#/world/core/empty-offer"
import { sameTrade } from "#/world/server/map-room/same-trade"
import type { TradeSide } from "#/world/server/map-room/presence"

const trade: TradeSide = { session: "first", with: "peer", open: true, offer: emptyOffer(), shown: [], locked: false, done: false }

it("compares identity rather than offer and confirmation state", () => {
  expect(sameTrade(trade, { ...trade, locked: true, done: true, offerVersion: 5 })).toBe(true)
  expect(sameTrade(trade, { ...trade, session: "later" })).toBe(false)
  expect(sameTrade(trade, { ...trade, with: "other" })).toBe(false)
})

it("requires both sides and preserves legacy invitations without a session", () => {
  expect(sameTrade(undefined, undefined)).toBe(false)
  expect(sameTrade(trade, undefined)).toBe(false)
  expect(sameTrade(undefined, trade)).toBe(false)
  expect(sameTrade({ ...trade, session: undefined }, { ...trade, session: undefined })).toBe(true)
  expect(sameTrade(trade, { ...trade, session: undefined })).toBe(false)
})
