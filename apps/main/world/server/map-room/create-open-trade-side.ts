import { emptyOffer } from "#/world/core/empty-offer"
import type { TradeSide } from "#/world/server/map-room/presence"

/** 識別子だけを共有し、提示と承認の状態は参加者ごとに独立させる。 */
export function createOpenTradeSide(peerId: string, session: string): TradeSide {
  return { session, with: peerId, open: true, offer: emptyOffer(), shown: [], locked: false, done: false }
}
