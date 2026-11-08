// The durable exchange envelope; order matching and delivery use separate core state.
import { emptyExchange } from "#/world/core/empty-exchange"
import type { ExchangeState } from "#/world/core/exchange-types"
import { emptyClaims } from "#/world/core/empty-claims"
import type { ExchangeClaims } from "#/world/core/exchange-claim-types"
import { emptyRequests } from "#/world/core/empty-requests"
import type { OrderRequests } from "#/world/core/exchange-order-types"

export type ExchangeRecord = {
  ex: ExchangeState
  delivery: ExchangeClaims
  requests: OrderRequests
}
export const initialExchangeRecord = (): ExchangeRecord => ({ ex: emptyExchange(), delivery: emptyClaims(), requests: emptyRequests() })
export const exchangeMigrations = [
  { version: 1, migrate: (old: unknown): ExchangeRecord => ({ ...(old as { ex: ExchangeState }), delivery: emptyClaims(), requests: emptyRequests() }) },
  { version: 2, migrate: (old: unknown): ExchangeRecord => ({ ...(old as Pick<ExchangeRecord, "ex" | "delivery">), requests: emptyRequests() }) },
]
