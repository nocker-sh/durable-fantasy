import { expect, it, vi } from "vitest"
import { SceneBuildQueue } from "#/world/scene/runtime/scene-build-queue"
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
it("does not let two builders mutate the shared world at once", async () => {
  const queue = new SceneBuildQueue(),
    pending = deferred<{ dispose(): void }>(),
    events: string[] = []
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
