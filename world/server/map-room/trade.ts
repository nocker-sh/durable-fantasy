import { handleTradeAsk } from "#/world/server/map-room/handle-trade-ask"
import { handleTradeAnswer } from "#/world/server/map-room/handle-trade-answer"
import { handleTradeOffer } from "#/world/server/map-room/handle-trade-offer"
import { handleTradeConfirmation } from "#/world/server/map-room/handle-trade-confirmation"
import { handleTradeCancel } from "#/world/server/map-room/handle-trade-cancel"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = {
  "trade-ask": handleTradeAsk,
  "trade-answer": handleTradeAnswer,
  "trade-offer": handleTradeOffer,
  "trade-lock": handleTradeConfirmation,
  "trade-go": handleTradeConfirmation,
  "trade-cancel": handleTradeCancel,
}
