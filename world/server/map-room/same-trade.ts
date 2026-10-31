import type { TradeSide } from "#/world/server/map-room/presence"

/** 同じ相手との次の取引を、通信待ちの前の取引と混同しない。 */
export function sameTrade(first: TradeSide | undefined, second: TradeSide | undefined): boolean {
  return !!first && !!second && first.session === second.session && first.with === second.with
}
