import { expect, it, vi } from "vitest"
import { openDevPage } from "#/scripts/lib/open-dev-page"
it("keeps the original readiness and settle conditions on a successful first load", async () => {
  const page = { goto: vi.fn(async () => ({ status: () => 200 })), waitForFunction: vi.fn(async () => null), waitForSelector: vi.fn(async () => null), waitForTimeout: vi.fn(async () => {}) }
  expect(await openDevPage({ page, url: "/dev/houses/h-m5", failures: [] })).toBeNull()
  expect(page.goto).toHaveBeenCalledTimes(1)
  expect(page.waitForSelector).toHaveBeenCalledWith('body[data-ready="1"]', { timeout: 15000 })
  expect(page.waitForTimeout).toHaveBeenCalledWith(300)
})
it("preserves an initial HTTP failure without retrying or measuring its error page", async () => {
  const page = { goto: vi.fn(async () => ({ status: () => 500 })), waitForFunction: vi.fn(async () => null), waitForSelector: vi.fn(async () => null), waitForTimeout: vi.fn(async () => {}) }
  expect(await openDevPage({ page, url: "/dev", failures: [] })).toEqual(new Error("Dev page navigation failed: 500"))
  expect(page.goto).toHaveBeenCalledTimes(1)
  expect(page.waitForSelector).not.toHaveBeenCalled()
})
it("does not silently recover from readiness timeouts and retains the underlying script failure", async () => {
  const page = {
    goto: vi.fn(async () => ({ status: () => 200 })),
    waitForFunction: vi.fn(async () => null),
    waitForSelector: vi.fn(async () => {
      throw new Error("readiness timed out")
    }),
    waitForTimeout: vi.fn(async () => {}),
  }
  const error = await openDevPage({ page, url: "/dev", failures: ["HTTP 500 /dev/db.tsx"] })
  expect(error?.message).toContain("readiness timed out")
  expect(error?.message).toContain("HTTP 500 /dev/db.tsx")
  expect(page.goto).toHaveBeenCalledTimes(1)
})
it("rejects hydration and resource failures even when a ready marker is present", async () => {
  const page = { goto: vi.fn(async () => ({ status: () => 200 })), waitForFunction: vi.fn(async () => null), waitForSelector: vi.fn(async () => null), waitForTimeout: vi.fn(async () => {}) }
  expect(await openDevPage({ page, url: "/dev", failures: ["page: Invalid hook call"] })).toEqual(new Error("Dev page load failed: page: Invalid hook call"))
})
it("does not accept a navigation without an HTTP response", async () => {
  const page = { goto: vi.fn(async () => null), waitForFunction: vi.fn(async () => null), waitForSelector: vi.fn(async () => null), waitForTimeout: vi.fn(async () => {}) }
  expect(await openDevPage({ page, url: "/dev", failures: [] })).toEqual(new Error("Dev page navigation failed: no response"))
})
it("does not measure a layout whose visible thumbnails or fonts never become ready", async () => {
  const page = {
    goto: vi.fn(async () => ({ status: () => 200 })),
    waitForSelector: vi.fn(async () => null),
    waitForTimeout: vi.fn(async () => {}),
    waitForFunction: vi.fn(async () => {
      throw new Error("visible previews timed out")
    }),
  }
  expect((await openDevPage({ page, url: "/dev/objects", failures: [] }))?.message).toContain("visible previews timed out")
  expect(page.goto).toHaveBeenCalledTimes(1)
})
