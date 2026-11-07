import { resolve } from "node:path"
import { readFileSync } from "node:fs"

const root = process.cwd()
const paths: Record<string, string[]> = JSON.parse(readFileSync(resolve(root, "tsconfig.json"), "utf8")).compilerOptions.paths
const aliases = Object.entries(paths)
  .filter(([pattern]) => pattern.endsWith("*"))
  .sort(([a], [b]) => b.length - a.length)

/** Resolve source files and directories using the same aliases as the application. */
export function resolveProjectSource(path: string): string {
  const specifier = `#/${path.replace(/\/?$/, "/")}`
  const match = aliases.find(([pattern]) => specifier.startsWith(pattern.slice(0, -1)))
  if (!match || match[1].length !== 1 || !match[1][0].endsWith("*")) throw new Error(`Unsupported source alias: ${path}`)
  return resolve(root, match[1][0].slice(0, -1) + specifier.slice(match[0].length - 1))
}
