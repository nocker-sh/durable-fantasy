import { expect, it } from "vitest"
import { getRuntimeModuleUrl } from "#/scripts/lib/get-runtime-module-url"

it("returns the actual loaded URL including its version query", () => {
  const url = "http://localhost:4027/world/scene/is-free.ts?t=42"
  expect(getRuntimeModuleUrl({ path: "/world/scene/is-free", resources: [url, url, "http://localhost:4027/world/scene/is-free.test.ts"] })).toBe(url)
})

it("rejects a missing module instead of importing a new instance", () => {
  expect(() => getRuntimeModuleUrl({ path: "/world/scene/is-free", resources: ["http://localhost:4027/world/scene/walk-h.ts"] })).toThrow("found 0")
})

it("rejects ambiguous versions and sibling filenames", () => {
  const url = "http://localhost:4027/world/scene/is-free.ts"
  expect(() => getRuntimeModuleUrl({ path: "/world/scene/is-free", resources: [url, `${url}?t=2`] })).toThrow("found 2")
  expect(() => getRuntimeModuleUrl({ path: "/world/scene/is", resources: [url] })).toThrow("found 0")
})

it("distinguishes executable source from raw text used for cache versioning", () => {
  const url = "http://localhost:4027/world/scene/world.ts"
  expect(getRuntimeModuleUrl({ path: "/world/scene/world", resources: [url, `${url}?raw`] })).toBe(url)
  expect(() => getRuntimeModuleUrl({ path: "/world/scene/world", resources: [`${url}?raw`] })).toThrow("found 0")
})
