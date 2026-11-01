export const MARKET_DAY_MS = 86_400_000
export const MARKET_JST_OFFSET_MS = 9 * 3_600_000
export const SLIPPAGE = 0.05
/** what a shop pays for a plain thing (gathered, bought in), as a share of its list price at the usual stock */
export const BUYBACK_RATE = 0.45
/** what a shop pays for a made thing: it must check the work and sell it on, so it pays less (economy.md §4.1) */
export const MADE_BUYBACK_RATE = 0.3
/** the most a counter's preference for a kind may raise what it pays: 0.45 × 1.1 stays under half the price */
export const MAX_SHOP_RATE = 1.1
