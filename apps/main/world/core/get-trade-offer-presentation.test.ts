import { expect, it } from "vitest"
import { getTradeOfferPresentation } from "#/world/core/get-trade-offer-presentation"
import { TRADE_LOTS } from "#/world/core/trade-rules"
import type { Bag } from "#/world/core/bag-types"

it("copies displayed stacks in offer order without reserving or changing the bag", () => {
  const bag: Bag = [
    { item: "log", count: 5, q: 1, by: "maker" },
    { item: "apple", count: 3 },
  ]
  const before = structuredClone(bag)
  const presentation = getTradeOfferPresentation(
    { bag, gold: 10 },
    {
      lots: [
        { slot: 1, count: 2 },
        { slot: 0, count: 5 },
      ],
      gold: 10,
    },
  )
  expect(presentation?.shown).toEqual([
    { item: "apple", count: 2 },
    { item: "log", count: 5, q: 1, by: "maker" },
  ])
  expect(presentation?.shown[1]).not.toBe(bag[0])
  expect(bag).toEqual(before)
})

it("rejects empty slots, insufficient counts, key items, duplicate slots and excess gold", () => {
  const player = { bag: [{ item: "log", count: 5 }, null, { item: "sealed-letter", count: 1 }], gold: 10 } satisfies { bag: Bag; gold: number }
  for (const lots of [
    [{ slot: 1, count: 1 }],
    [{ slot: 0, count: 6 }],
    [{ slot: 2, count: 1 }],
    [
      { slot: 0, count: 1 },
      { slot: 0, count: 1 },
    ],
  ]) {
    expect(getTradeOfferPresentation(player, { lots, gold: 0 })).toBeNull()
  }
  expect(getTradeOfferPresentation(player, { lots: [], gold: 11 })).toBeNull()
  expect(getTradeOfferPresentation(player, { lots: [], gold: 10 })).toEqual({ offer: { lots: [], gold: 10 }, shown: [] })
})

it("only checks the accepted number of lots, retaining the existing wire limit", () => {
  const bag: Bag = Array.from({ length: TRADE_LOTS }, () => ({ item: "log", count: 1 }))
  const lots = [...bag.map((_stack, slot) => ({ slot, count: 1 })), { slot: 999, count: 1 }]
  const presentation = getTradeOfferPresentation({ bag, gold: 0 }, { lots, gold: 0 })
  expect(presentation?.offer.lots).toEqual(lots.slice(0, TRADE_LOTS))
  expect(presentation?.shown).toHaveLength(TRADE_LOTS)
  expect(lots).toHaveLength(TRADE_LOTS + 1)
})
