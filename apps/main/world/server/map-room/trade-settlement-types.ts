import type { Player } from "#/durable-objects/player"
import type { Ctx } from "#/world/server/map-room/context"
import type { Presence, TradeSide } from "#/world/server/map-room/presence"

export type TradeSettlementContext = Readonly<{
  room: Ctx
  peer: Ctx["ctx"]["connection"]
  mine: TradeSide
  other: Presence
  ownerA: string
  ownerB: string
  playerA: Pick<ReturnType<typeof Player.get>, "read" | "tradeStatus" | "beginTrade" | "advanceTrade">
  playerB: Pick<ReturnType<typeof Player.get>, "read" | "tradeStatus" | "beginTrade" | "advanceTrade">
}>
