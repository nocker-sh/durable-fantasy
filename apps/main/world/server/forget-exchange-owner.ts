import type { ExchangeRecord } from "#/world/server/exchange-record"

/** Dev-only save reset: drop a player's orders, waiting inbox and order request without paying anything back. */
export function forgetExchangeOwner(record: ExchangeRecord, owner: string): void {
  record.ex = { ...record.ex, orders: record.ex.orders.filter((order) => order.owner !== owner), inbox: withoutKey(record.ex.inbox, owner) }
  record.delivery = { ...record.delivery, claims: withoutKey(record.delivery.claims, owner) }
  record.requests = { ...record.requests, jobs: withoutKey(record.requests.jobs, owner) }
}

function withoutKey<T>(table: Record<string, T>, key: string): Record<string, T> {
  const next = { ...table }
  delete next[key]
  return next
}
