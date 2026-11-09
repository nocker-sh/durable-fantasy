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

it("finds a game module the studio loaded by its absolute path", () => {
  const studio = "https://dev.durable-fantasy.localhost/@fs/Users/me/durable-fantasy/apps/main/world/scene/world.ts?t=7"
  expect(getRuntimeModuleUrl({ path: "/world/scene/world", resources: [studio, `${studio}&raw`] })).toBe(studio)
  expect(() => getRuntimeModuleUrl({ path: "/world/scene/world", resources: ["https://dev.durable-fantasy.localhost/@fs/Users/me/durable-fantasy/lib/world/scene/world.ts"] })).toThrow("found 0")
  expect(() => getRuntimeModuleUrl({ path: "/world/scene/world", resources: [studio, "https://dev.durable-fantasy.localhost/world/scene/world.ts"] })).toThrow("found 2")
})

it("distinguishes executable source from raw text used for cache versioning", () => {
  const url = "http://localhost:4027/world/scene/world.ts"
  expect(getRuntimeModuleUrl({ path: "/world/scene/world", resources: [url, `${url}?raw`] })).toBe(url)
  expect(() => getRuntimeModuleUrl({ path: "/world/scene/world", resources: [`${url}?raw`] })).toThrow("found 0")
})
