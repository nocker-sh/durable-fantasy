import { RETRY_MS } from "#/world/server/wild-coordinator"

/** The longest a refused delivery waits before it is tried again. */
export const MAX_DELIVERY_WAIT_MS = 5 * 60_000

/** Refusals in a row that are still retried at every alarm: a lost reply or a short hold clears within them. */
export const QUICK_RETRIES = 6

export type DeliveryRetry = Readonly<{ at: number; wait: number; misses: number }>

/**
 * When to try a refused delivery again. The first few go at the usual alarm pace; after that the
 * wait doubles up to a ceiling, so a recipient who stays fallen (or holds a trade) is not called
 * every few seconds for as long as they are away.
 */
export function nextDeliveryRetry(previous: DeliveryRetry | undefined, now: number): DeliveryRetry {
  const misses = (previous?.misses ?? 0) + 1
  if (misses <= QUICK_RETRIES) return { at: now, wait: RETRY_MS, misses }
  const wait = Math.min((previous?.wait ?? RETRY_MS) * 2, MAX_DELIVERY_WAIT_MS)
  return { at: now + wait, wait, misses }
}
