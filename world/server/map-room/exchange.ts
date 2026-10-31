import { handleExchangeRequest } from "#/world/server/map-room/handle-exchange-request"
import type { Handlers } from "#/world/server/map-room/context"

export const HANDLERS: Handlers = {
  "ex-look": handleExchangeRequest,
  "ex-place": handleExchangeRequest,
  "ex-cancel": handleExchangeRequest,
  "ex-claim": handleExchangeRequest,
}
