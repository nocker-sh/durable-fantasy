import { fileURLToPath } from "node:url"
import * as fingerprints from "#/lib/engine/get-source-fingerprint"
import { resolveProjectSource } from "#/scripts/lib/resolve-project-source.test-support"
import { existsSync, globSync, readFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { expect, it, vi } from "vitest"

it("invalidates stored ground when any local painting dependency changes", async () => {
  const versionFile = fileURLToPath(new URL("./ground-version.ts", import.meta.url))
  const versionSource = readFileSync(versionFile, "utf8")
  const patterns = [...versionSource.matchAll(/"([^"\n]+\.ts)"/g)].map((match) => match[1])
  for (const pattern of patterns) expect(/^(?:\.{1,2}\/|\/|#\/)/.test(pattern), pattern).toBe(true)
  const fingerprinted = new Set(patterns.flatMap((pattern) => globSync(pattern.startsWith("#/") ? resolveProjectSource(pattern.slice(2)) : resolve(dirname(versionFile), pattern))))
  const pending = ["./paint-ground.ts", "./mesh-heights.ts", "./world.ts", "./set-layout.ts", "./ground-h.ts", "../maps/layouts.ts"].map((file) => fileURLToPath(new URL(file, import.meta.url)))
  const visited = new Set<string>()
  while (pending.length) {
    const file = pending.pop()
    if (!file || visited.has(file)) continue
    visited.add(file)
    expect(fingerprinted.has(file), relative(resolve(), file)).toBe(true)
    const source = readFileSync(file, "utf8")
    const staticImports = [...source.matchAll(/^(?:import|export)[ \t]+((?:[\w$]+\s*,\s*)?(?:\{[^}]*\}|\*(?:\s+as\s+[\w$]+)?)|[\w$]+)\s+from\s+["']([^"']+)["']/gm)]
      .filter(
        (match) =>
          !match[1].trim().startsWith("{") ||
          match[1]
            .replace(/[{}]/g, "")
            .split(",")
            .some((binding) => binding.trim() && !binding.trim().startsWith("type ")),
      )
      .map((match) => match[2])
    const dynamicImports = [...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g)].map((match) => match[1])
    for (const specifier of [...staticImports, ...dynamicImports]) {
      if (!specifier.startsWith(".") && !specifier.startsWith("#/")) continue
      const target = specifier.startsWith("#/") ? resolveProjectSource(specifier.slice(2)) : resolve(dirname(file), specifier)
      const dependency = [`${target}.ts`, resolve(target, "index.ts")].find(existsSync)
      if (dependency) pending.push(dependency)
    }
  }
  expect(visited.size).toBeGreaterThan(2)
  const observe = vi.spyOn(fingerprints, "getSourceFingerprint")
  try {
    const parts1 = await import("#/world/scene/ground-version")
    const GROUND_VERSION = parts1.GROUND_VERSION
    expect(observe).toHaveBeenCalledTimes(1)
    const sources = observe.mock.calls[0][0]
    expect(Object.values(sources).sort()).toEqual([...fingerprinted].map((file) => readFileSync(file, "utf8")).sort())
    expect(GROUND_VERSION).toBe(observe.mock.results[0].value)
  } finally {
    observe.mockRestore()
  }
})
