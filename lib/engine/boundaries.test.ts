import { readdirSync, readFileSync } from "node:fs"
import { resolve, dirname, sep } from "node:path"
import { expect, it } from "vitest"

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? sources(path) : /\.tsx?$/.test(path) && !path.endsWith(".test.ts") ? [path] : []
  })
}

function dependencyTarget(file: string, dependency: string): string | null {
  if (dependency.startsWith("#/")) return resolve(dependency.slice(2))
  if (dependency.startsWith(".")) return resolve(dirname(file), dependency)
  return null
}

function graphicsDependencyAllowed(file: string, dependency: string): boolean {
  const target = dependencyTarget(file, dependency)
  return dependency === "three" || (target !== null && [resolve("lib/graphics"), resolve("lib/engine")].some((base) => target.startsWith(base + sep)))
}

it("resolves root aliases without allowing graphics to reach world, UI or escaped directories", () => {
  const file = resolve("lib/graphics/ray/example.ts")
  for (const dependency of ["#/lib/graphics/ray/primitive-types", "#/lib/engine/lerp-vector3", "./primitive-types", "../../engine/lerp-vector3", "three"])
    expect(graphicsDependencyAllowed(file, dependency)).toBe(true)
  for (const dependency of ["#/world/scene/figure/body", "#/components/game/game", "#/lib/graphics/../../world/state", "react", "three/../world"])
    expect(graphicsDependencyAllowed(file, dependency)).toBe(false)
})

it("game engine dependencies stay inside the engine", () => {
  const directory = resolve("lib/engine")
  for (const file of sources(directory)) {
    const source = readFileSync(file, "utf8")
    const imports = [...source.matchAll(/(?:from\s*|import\s*\()['"]([^'"]+)['"]/g)].map((match) => match[1])
    for (const dependency of imports) {
      const target = dependencyTarget(file, dependency)
      const allowed = target !== null && target.startsWith(directory + sep)
      expect(allowed, `${file} imports ${dependency}`).toBe(true)
    }
  }
})

it("world logic does not import UI or developer tools", () => {
  const uiDirectories = ["components", "hooks", "dev", "pages"].map((directory) => resolve(directory) + sep)
  for (const file of sources("world")) {
    const source = readFileSync(file, "utf8")
    const imports = [...source.matchAll(/(?:from\s*|import\s*\()['"]([^'"]+)['"]/g)].map((match) => match[1])
    for (const dependency of imports) {
      const target = dependency.startsWith("#/") ? resolve(dependency.slice(2)) : resolve(file, "..", dependency)
      expect(dependency !== "react" && !dependency.startsWith("react/") && !dependency.startsWith("@void/react"), `${file} imports ${dependency}`).toBe(true)
      if (["world/core", "world/town", "world/server"].some((directory) => file.startsWith(resolve(directory) + sep)))
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
      expect(graphicsDependencyAllowed(file, dependency), `${file} imports ${dependency}`).toBe(true)
    }
  }
})

// Static import clauses may span lines; statement-ending semicolons are optional.
function runtimeDependencies(source: string): string[] {
  const imports = [...source.matchAll(/^import[ \t]+(?!type\b)((?:[\w$]+\s*,\s*)?(?:\{[^}]*\}|\*\s+as\s+[\w$]+)|[\w$]+)\s+from\s+["']([^"']+)["']/gm)]
  const exports = [...source.matchAll(/^export[ \t]+(?!type\b)(\{[^}]*\}|\*(?:\s+as\s+\w+)?)\s+from\s+["']([^"']+)["']/gm)]
  const dependencies = [...imports, ...exports]
    .filter(([, clause]) => {
      return (
        !clause.trim().startsWith("{") ||
        clause
          .replace(/[{}]/g, "")
          .split(",")
          .some((part) => part.trim() && !part.trim().startsWith("type "))
      )
    })
    .map(([, , specifier]) => specifier)
  const sideEffects = [...source.matchAll(/^import[ \t]+["']([^"']+)["']/gm)].map(([, specifier]) => specifier)
  return [...dependencies, ...sideEffects]
}

it("reads runtime dependencies with and without semicolons, excluding type-only clauses", () => {
  expect(
    runtimeDependencies(`
import { value, type Shape } from "./value.ts"
import Default from "./default.ts";
import DefaultAndNamed, { named } from "./combined.ts"
import * as namespace from "./namespace.ts"
import {
  multiline,
  type Other,
} from "./multiline.ts"
import type { Shape } from "./type.ts"
import { type Shape, type Other } from "./inline-types.ts"
export { value } from "./export.ts"
export * from "./star.ts";
export * as namespace from "./export-namespace.ts"
export type { Shape } from "./export-type.ts"
export { type Shape } from "./export-inline-type.ts"
import "./side-effect.ts"
`),
  ).toEqual(["./value.ts", "./default.ts", "./combined.ts", "./namespace.ts", "./multiline.ts", "./export.ts", "./star.ts", "./export-namespace.ts", "./side-effect.ts"])
})

it("application modules have no circular runtime imports", () => {
  const files = ["world", "lib", "components", "hooks", "dev", "pages", "routes", "middleware", "durable-objects"].flatMap(sources)
  const known = new Set(files)
  const graph = new Map<string, string[]>()
  for (const file of files) {
    const source = readFileSync(file, "utf8")
    const dependencies: string[] = []
    for (const specifier of runtimeDependencies(source)) {
      if (specifier.includes("?raw")) continue
      if (!specifier.startsWith(".") && !specifier.startsWith("#/")) continue
      const target = specifier.startsWith("#/") ? resolve(specifier.slice(2)) : resolve(dirname(file), specifier)
      const resolved = [target, `${target}.ts`, `${target}.tsx`, resolve(target, "index.ts"), resolve(target, "index.tsx")].find((path) => known.has(path))
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
