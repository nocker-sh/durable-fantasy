import { cancel } from "#/world/core/cancel"
import { expire } from "#/world/core/expire"
import type { ExchangeContext } from "#/world/server/exchange-coordinator"

export function cancelExchangeOrder(context: Pick<ExchangeContext, "state">, owner: string, id: string): boolean {
  const next = cancel(expire(context.state.ex, Date.now()), owner, id)
  if (!next) return false
  context.state.ex = next
  return true
}
