import { dirname } from "node:path"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { resolveProjectSource } from "#/scripts/lib/resolve-project-source.test-support"

it.each([
  { path: "world/scene/ground-version.ts", sources: import.meta.glob<string>("#/world/scene/ground-version.ts", { query: "?raw", import: "default", eager: true }) },
  { path: "dev/sources.ts", sources: import.meta.glob<string>("#/dev/sources.ts", { query: "?raw", import: "default", eager: true }) },
  { path: "lib/engine/lerp.ts", sources: import.meta.glob<string>("#/lib/engine/lerp.ts", { query: "?raw", import: "default", eager: true }) },
])("reads the actual application module for $path", (props1) => {
  const path = props1.path,
    sources = props1.sources

  expect(Object.keys(sources)).toHaveLength(1)
  const pair2 = Object.values(sources)
  const source = pair2[0]
  const file = resolveProjectSource(path)
  expect(source.length).toBeGreaterThan(0)
  expect(readFileSync(file, "utf8")).toBe(source)
  expect(resolveProjectSource(path.slice(0, path.lastIndexOf("/")))).toBe(dirname(file))
})
