import type { Symbol } from "#/world/core/exchange-types"
export function symbolKey(symbol: Symbol) {
  return symbol.q === undefined ? symbol.item : `${symbol.item}@${symbol.q}`
}
