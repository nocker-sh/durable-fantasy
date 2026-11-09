// The durable exchange envelope; order matching and delivery use separate core state.
import { emptyExchange } from "#/world/core/empty-exchange"
import type { ExchangeState } from "#/world/core/exchange-types"
import { emptyClaims } from "#/world/core/empty-claims"
import type { ExchangeClaims } from "#/world/core/exchange-claim-types"
import { emptyRequests } from "#/world/core/empty-requests"
import type { OrderRequests } from "#/world/core/exchange-order-types"
import { withoutEmptyInboxes } from "#/world/core/without-empty-inboxes"

export type ExchangeRecord = {
  ex: ExchangeState
  delivery: ExchangeClaims
  requests: OrderRequests
}
export const initialExchangeRecord = (): ExchangeRecord => ({ ex: emptyExchange(), delivery: emptyClaims(), requests: emptyRequests() })
export const exchangeMigrations = [
  { version: 1, migrate: (old: unknown): ExchangeRecord => ({ ...(old as { ex: ExchangeState }), delivery: emptyClaims(), requests: emptyRequests() }) },
  { version: 2, migrate: (old: unknown): ExchangeRecord => ({ ...(old as Pick<ExchangeRecord, "ex" | "delivery">), requests: emptyRequests() }) },
  // boxes left empty by earlier zero credits are dropped once; no box holding gold or goods is touched
  {
    version: 3,
    migrate: (old: unknown): ExchangeRecord => {
      const record = old as ExchangeRecord
      return { ...record, ex: { ...record.ex, inbox: withoutEmptyInboxes(record.ex.inbox) } }
    },
  },
]
