import { readdirSync, readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { expect, it } from "vitest"

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? sources(path) : /\.tsx?$/.test(path) && !path.endsWith(".test.ts") ? [path] : []
  })
}

it("game engine dependencies stay inside the engine", () => {
  const directory = resolve("lib/engine")
  for (const file of sources(directory)) {
    const source = readFileSync(file, "utf8")
    const imports = [...source.matchAll(/(?:from\s*|import\s*\()['"]([^'"]+)['"]/g)].map((match) => match[1])
    for (const dependency of imports) {
      const allowed = dependency.startsWith("./") && resolve(dirname(file), dependency).startsWith(directory + "/")
      expect(allowed, `${file} imports ${dependency}`).toBe(true)
    }
  }
})

it("world logic does not import UI or developer tools", () => {
  const uiDirectories = ["components", "hooks", "dev", "pages"].map((directory) => resolve(directory) + "/")
  for (const file of sources("world")) {
    const source = readFileSync(file, "utf8")
    const imports = [...source.matchAll(/(?:from\s*|import\s*\()['"]([^'"]+)['"]/g)].map((match) => match[1])
    for (const dependency of imports) {
      const target = dependency.startsWith("#/") ? resolve(dependency.slice(2)) : resolve(file, "..", dependency)
      expect(dependency !== "react" && !dependency.startsWith("react/") && !dependency.startsWith("@void/react"), `${file} imports ${dependency}`).toBe(true)
      if (["world/core", "world/town", "world/server"].some((directory) => file.startsWith(resolve(directory) + "/")))
        expect(dependency !== "three" && !dependency.startsWith("three/"), `${file} imports ${dependency}`).toBe(true)
      expect(
        uiDirectories.some((directory) => target.startsWith(directory)),
        `${file} imports ${dependency}`,
      ).toBe(false)
    }
  }
})

it("graphics dependencies stay inside graphics, engine, or Three.js", () => {
  const directory = resolve("lib/graphics")
  for (const file of sources(directory)) {
    const source = readFileSync(file, "utf8")
    const imports = [...source.matchAll(/(?:from\s*|import\s*\()['"]([^'"]+)['"]/g)].map((match) => match[1])
    for (const dependency of imports) {
      const target = resolve(dirname(file), dependency)
      expect(dependency === "three" || (dependency.startsWith(".") && [directory, resolve("lib/engine")].some((base) => target.startsWith(base + "/"))), `${file} imports ${dependency}`).toBe(true)
    }
  }
})

it("application modules have no circular runtime imports", () => {
  const files = ["world", "lib", "components", "hooks", "dev", "pages", "routes", "middleware", "durable-objects"].flatMap(sources)
  const known = new Set(files)
  const graph = new Map<string, string[]>()
  for (const file of files) {
    const source = readFileSync(file, "utf8")
    const imports = [...source.matchAll(/^import\s+(?!type\b)([^;]+?)\s+from\s+["']([^"']+)["'];/gm)]
    const exports = [...source.matchAll(/^export\s+(?!type\b)(\{[^}]*\}|\*(?:\s+as\s+\w+)?)\s+from\s+["']([^"']+)["'];/gm)]
    const dependencies: string[] = []
    for (const [, clause, specifier] of [...imports, ...exports]) {
      if (specifier.includes("?raw")) continue
      if (
        clause.trim().startsWith("{") &&
        clause
          .replace(/[{}]/g, "")
          .split(",")
          .filter((part) => part.trim())
          .every((part) => part.trim().startsWith("type "))
      )
        continue
      if (!specifier.startsWith(".") && !specifier.startsWith("#/")) continue
      const target = specifier.startsWith("#/") ? resolve(specifier.slice(2)) : resolve(dirname(file), specifier)
      const resolved = [target, `${target}.ts`, `${target}.tsx`, `${target}/index.ts`, `${target}/index.tsx`].find((path) => known.has(path))
      if (resolved) dependencies.push(resolved)
    }
    graph.set(file, dependencies)
  }
  const visited = new Set<string>()
  const active = new Set<string>()
  const stack: string[] = []
  const cycles: string[][] = []
  function visit(file: string) {
    if (active.has(file)) {
      cycles.push([...stack.slice(stack.indexOf(file)), file])
      return
    }
    if (visited.has(file)) return
    visited.add(file)
    active.add(file)
    stack.push(file)
    for (const dependency of graph.get(file) ?? []) visit(dependency)
    stack.pop()
    active.delete(file)
  }
  for (const file of files) visit(file)
  expect(cycles).toEqual([])
})
