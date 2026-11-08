import { expect, it, vi } from "vitest"
import { MAX_DELIVERY_WAIT_MS, QUICK_RETRIES, nextDeliveryRetry, type DeliveryRetry } from "#/world/server/next-delivery-retry"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))

it("retries at every alarm at first, then waits longer and longer up to the ceiling", () => {
  const seen: DeliveryRetry[] = []
  for (let attempt = 0; attempt < 20; attempt++) seen.push(nextDeliveryRetry(seen.at(-1), 1000))
  expect(seen.slice(0, QUICK_RETRIES).every((retry) => retry.at === 1000)).toBe(true)
  const waits = seen.slice(QUICK_RETRIES).map((retry) => retry.at - 1000)
  for (const [index, wait] of waits.entries()) if (index > 0) expect(wait).toBeGreaterThanOrEqual(waits[index - 1])
  expect(waits.at(-1)).toBe(MAX_DELIVERY_WAIT_MS)
  // a recipient away for an hour is called a few dozen times, not every five seconds (720)
  const calls = { count: 0, at: 0, retry: undefined as DeliveryRetry | undefined }
  while (calls.at < 60 * 60_000) {
    calls.retry = nextDeliveryRetry(calls.retry, calls.at)
    calls.count++
    calls.at = Math.max(calls.retry.at, calls.at + 5000)
  }
  expect(calls.count).toBeLessThan(40)
})
