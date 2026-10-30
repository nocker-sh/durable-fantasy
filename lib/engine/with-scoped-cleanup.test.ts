import { expect, it, vi } from "vitest"
import { withScopedCleanup } from "./with-scoped-cleanup"

it("waits for cleanup before returning the original result", async () => {
  const value = { pixels: 42 }
  const gate = { finish: () => {}, start: () => {}, completed: false }
  const cleanup = new Promise<void>((resolve) => {
    gate.finish = () => resolve()
  })
  const started = new Promise<void>((resolve) => {
    gate.start = () => resolve()
  })
  const result = withScopedCleanup(
    () => value,
    () => {
      gate.start()
      return cleanup
    },
  )
  const completed = result.then((returned) => {
    gate.completed = true
    return returned
  })
  await started
  await Promise.resolve()
  expect(gate.completed).toBe(false)
  gate.finish()
  expect(await completed).toBe(value)
})

it("cleans up after either synchronous or asynchronous work failures without replacing them", async () => {
  const failure = new Error("render failed")
  const cleanup = vi.fn()
  await expect(
    withScopedCleanup(() => {
      throw failure
    }, cleanup),
  ).rejects.toBe(failure)
  await expect(
    withScopedCleanup(async () => {
      throw failure
    }, cleanup),
  ).rejects.toBe(failure)
  expect(cleanup).toHaveBeenCalledTimes(2)
})

it("retains the cleanup error on success and both errors on failure", async () => {
  const renderError = new Error("render failed")
  const closeError = new Error("close failed")
  await expect(
    withScopedCleanup(
      () => 42,
      () => {
        throw closeError
      },
    ),
  ).rejects.toBe(closeError)
  const observed = await withScopedCleanup(
    () => {
      throw renderError
    },
    async () => {
      throw closeError
    },
  ).then(
    () => null,
    (error: unknown) => error,
  )
  expect(observed).toBeInstanceOf(AggregateError)
  if (!(observed instanceof AggregateError)) throw new Error("Missing aggregate failure")
  expect(observed.errors[0]).toBe(renderError)
  expect(observed.errors[1]).toBe(closeError)
})
