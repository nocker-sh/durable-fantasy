import { expect, it, vi } from "vitest"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { withCleanup } from "#/lib/engine/with-cleanup"
it("releases partial async construction in reverse acquisition order", async () => {
  const order: string[] = [],
    error = new Error("population failed")
  await expect(
    withCleanup(async (resources) => {
      resources.defer(() => order.push("renderer"))
      await Promise.resolve()
      resources.defer(() => order.push("terrain"))
      throw error
    }),
  ).rejects.toBe(error)
  expect(order).toEqual(["terrain", "renderer"])
})
it("keeps successful resources until their owner leaves", async () => {
  const dispose = vi.fn(),
    owner = await withCleanup(async (resources) => {
      resources.use({ dispose })
      return resources
    })
  expect(dispose).not.toHaveBeenCalled()
  owner.dispose()
  owner.dispose()
  expect(dispose).toHaveBeenCalledOnce()
})
it("does not release a shared asset twice through different ownership paths", () => {
  const resources = new CleanupStack(),
    asset = { dispose: vi.fn() }
  resources.use(asset)
  resources.use(asset)
  resources.release(asset)
  resources.dispose()
  expect(asset.dispose).toHaveBeenCalledOnce()
})
it("continues cleanup after an error and retains the construction failure", async () => {
  const original = new Error("build"),
    cleanup = new Error("cleanup"),
    remaining = vi.fn()
  const result = withCleanup(async (resources) => {
    resources.defer(remaining)
    resources.defer(() => {
      throw cleanup
    })
    throw original
  })
  const error = await result.catch((error: AggregateError) => error)
  expect(error.errors[0]).toBe(original)
  expect(error.errors[1].errors).toEqual([cleanup])
  expect(remaining).toHaveBeenCalledOnce()
})
it("immediately releases resources acquired after closing", () => {
  const resources = new CleanupStack(),
    dispose = vi.fn()
  resources.dispose()
  resources.use({ dispose })
  expect(dispose).toHaveBeenCalledOnce()
})
