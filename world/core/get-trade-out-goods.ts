import type { Bag, Stack } from "#/world/core/bag-types"
import type { Offer } from "#/world/core/trade-types"
import type { TradeGoods } from "#/world/core/trade-goods-types"
import { ITEMS } from "#/world/core/items/catalog"
import { takeFromSlot } from "#/world/core/take-from-slot"

/** 提示した枠だけを取り出す。途中で失敗しても元の持ち物を変えない。 */
export function getTradeOutGoods(bag: Bag, lots: Offer["lots"]): TradeGoods {
  if (new Set(lots.map((lot) => lot.slot)).size !== lots.length) return { ok: false, reason: "NOT_ENOUGH" }

  const stacks: Stack[] = []
  const outgoing = { bag, stacks }
  for (const lot of lots) {
    const stack = bag[lot.slot]
    if (!stack) return { ok: false, reason: "EMPTY_SLOT" }
    if (ITEMS[stack.item].kind === "key") return { ok: false, reason: "NOT_TRADABLE" }
    const next = takeFromSlot(outgoing.bag, lot.slot, lot.count)
    if (!next) return { ok: false, reason: "NOT_ENOUGH" }
    outgoing.bag = next
    outgoing.stacks.push({ ...stack, count: lot.count })
  }
  return { ok: true, bag: outgoing.bag, stacks: outgoing.stacks }
}
