import { expect, it, vi } from "vitest"
import { SceneBuildQueue } from "#/world/scene/runtime/scene-build-queue"
function deferred<T>() {
  const completion: { resolve(value: T): void; reject(error: Error): void } = { resolve: () => {}, reject: () => {} }
  const promise = new Promise<T>((resolve, reject) => {
    completion.resolve = resolve
    completion.reject = reject
  })
  return { promise, resolve: completion.resolve, reject: completion.reject }
}
it("does not let two builders mutate the shared world at once", async () => {
  const queue = new SceneBuildQueue(),
    pending = deferred<{ dispose(): void }>(),
    events: string[] = []
  expect(Object.isFrozen(queue)).toBe(true)
  const first = queue.run(async () => {
    events.push("first starts")
    return pending.promise
  })
  const second = queue.run(async () => {
    events.push("second starts")
    return { dispose() {} }
  })
  await Promise.resolve()
  expect(events).toEqual(["first starts"])
  pending.resolve({ dispose() {} })
  await first
  await second
  expect(events).toEqual(["first starts", "second starts"])
})
it("skips a map abandoned while waiting for another build", async () => {
  const queue = new SceneBuildQueue(),
    pending = deferred<{ dispose(): void }>(),
    controller = new AbortController(),
    build = vi.fn()
  const first = queue.run(() => pending.promise)
  const abandoned = queue.run(build, controller.signal)
  const rejected = expect(abandoned).rejects.toMatchObject({ name: "AbortError" })
  controller.abort()
  pending.resolve({ dispose() {} })
  await first
  await rejected
  expect(build).not.toHaveBeenCalled()
})
it("releases an abandoned build before the next map can reset registries", async () => {
  const queue = new SceneBuildQueue(),
    pending = deferred<{ dispose(): void }>(),
    controller = new AbortController(),
    events: string[] = []
  const abandoned = queue.run(() => pending.promise, controller.signal)
  const rejected = expect(abandoned).rejects.toMatchObject({ name: "AbortError" })
  await Promise.resolve()
  controller.abort()
  const next = queue.run(async () => {
    events.push("next starts")
    return { dispose() {} }
  })
  expect(events).toEqual([])
  pending.resolve({
    dispose() {
      events.push("old disposed")
    },
  })
  await rejected
  await next
  expect(events).toEqual(["old disposed", "next starts"])
})
it("continues after a failed build instead of poisoning later entries", async () => {
  const queue = new SceneBuildQueue(),
    error = new Error("build failed"),
    runtime = { dispose: vi.fn() }
  const failed = queue.run(async () => {
    throw error
  })
  const next = queue.run(async () => runtime)
  await expect(failed).rejects.toBe(error)
  expect(await next).toBe(runtime)
  expect(runtime.dispose).not.toHaveBeenCalled()
})

it("preserves the cancellation reason and cleanup failure and still permits the next build", async () => {
  const queue = new SceneBuildQueue()
  const pending = deferred<{ dispose(): void }>()
  const controller = new AbortController()
  const reason = new Error("owner left")
  const cleanupError = new Error("release failed")
  const cancelled = queue.run(() => pending.promise, controller.signal)
  const observed = cancelled.catch((error: unknown) => error)
  await Promise.resolve()
  controller.abort(reason)
  const dispose = vi.fn(() => {
    throw cleanupError
  })
  pending.resolve({ dispose })
  const failure = await observed
  expect(failure).toBeInstanceOf(AggregateError)
  if (failure instanceof AggregateError) expect(failure.errors).toEqual([reason, cleanupError])
  expect(dispose).toHaveBeenCalledOnce()
  const next = { dispose: vi.fn() }
  expect(await queue.run(async () => next)).toBe(next)
})

it("waits for asynchronous cleanup of an abandoned build before starting the next one", async () => {
  const queue = new SceneBuildQueue()
  const pending = deferred<{ dispose(): Promise<void> }>()
  const cleanup = deferred<void>()
  const cleanupStarted = deferred<void>()
  const controller = new AbortController()
  const order: string[] = []
  const cancelled = queue.run(() => pending.promise, controller.signal)
  const rejected = expect(cancelled).rejects.toMatchObject({ name: "AbortError" })
  await Promise.resolve()
  controller.abort()
  pending.resolve({
    dispose: async () => {
      order.push("cleanup starts")
      cleanupStarted.resolve(undefined)
      await cleanup.promise
      order.push("cleanup ends")
    },
  })
  const next = queue.run(async () => {
    order.push("next starts")
    return { dispose() {} }
  })
  await cleanupStarted.promise
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
  try {
    expect(order).toEqual(["cleanup starts"])
  } finally {
    cleanup.resolve(undefined)
  }
  await rejected
  await next
  expect(order).toEqual(["cleanup starts", "cleanup ends", "next starts"])
})
