import { afterEach, expect, it, vi } from "vitest"
import { OptionalCacheAccess } from "./optional-cache-access"
afterEach(() => vi.useRealTimers())

it("returns a successful read without retaining a timer or disabling later reads", async () => {
  vi.useFakeTimers()
  const cache = new OptionalCacheAccess(50)
  expect(await cache.run(async () => 7, 0)).toBe(7)
  expect(vi.getTimerCount()).toBe(0)
  expect(await cache.run(async () => 8, 0)).toBe(8)
})

it.each([false, true])("falls back after a cache error and stops retrying that path: synchronous=%s", async (synchronous) => {
  vi.useFakeTimers()
  const cache = new OptionalCacheAccess(50)
  const fail = () => {
    if (synchronous) throw Error("Cache unavailable")
    return Promise.reject(Error("Cache unavailable"))
  }
  expect(await cache.run(fail, null)).toBeNull()
  const retry = vi.fn(async () => 1)
  expect(await cache.run(retry, 0)).toBe(0)
  expect(retry).not.toHaveBeenCalled()
  expect(vi.getTimerCount()).toBe(0)
})

it("releases a late bitmap exactly once instead of delivering it after the fallback", async () => {
  vi.useFakeTimers()
  const cache = new OptionalCacheAccess(50)
  const image = { close: vi.fn() }
  let complete!: (value: typeof image) => void
  const release = vi.fn((value) => value?.close())
  const result = cache.run(
    () =>
      new Promise<typeof image>((resolve) => {
        complete = resolve
      }),
    null,
    release,
  )
  await vi.advanceTimersByTimeAsync(50)
  expect(await result).toBeNull()
  complete(image)
  await vi.advanceTimersByTimeAsync(0)
  expect(release).toHaveBeenCalledExactlyOnceWith(image)
  expect(image.close).toHaveBeenCalledOnce()
  expect(vi.getTimerCount()).toBe(0)
})
