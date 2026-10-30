import { existsSync, globSync, readFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { expect, it } from "vitest"

it("invalidates stored ground when any local painting dependency changes", () => {
  const versionFile = resolve("world/scene/ground-version.ts")
  const versionSource = readFileSync(versionFile, "utf8")
  const patterns = [...versionSource.matchAll(/"([^"\n]+\.ts)"/g)].map((match) => match[1])
  for (const pattern of patterns) expect(/^(?:\.{1,2}\/|\/)/.test(pattern), pattern).toBe(true)
  const fingerprinted = new Set(patterns.flatMap((pattern) => globSync(pattern, { cwd: dirname(versionFile) }).map((file) => resolve(dirname(versionFile), file))))
  const pending = ["world/scene/paint-ground.ts", "world/scene/mesh-heights.ts", "world/scene/world.ts", "world/scene/set-layout.ts", "world/scene/ground-h.ts", "world/maps/layouts.ts"].map((file) =>
    resolve(file),
  )
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
      const target = specifier.startsWith("#/") ? resolve(specifier.slice(2)) : resolve(dirname(file), specifier)
      const dependency = [`${target}.ts`, resolve(target, "index.ts")].find(existsSync)
      if (dependency) pending.push(dependency)
    }
  }
  expect(visited.size).toBeGreaterThan(2)
})
