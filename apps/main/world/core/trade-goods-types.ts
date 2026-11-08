import type { Bag, Stack } from "#/world/core/bag-types"
import type { Reason } from "#/world/core/commands"

export type TradeGoods = { ok: true; bag: Bag; stacks: Stack[] } | { ok: false; reason: Reason }
