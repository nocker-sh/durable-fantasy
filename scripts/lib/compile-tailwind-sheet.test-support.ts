import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname } from "node:path"

type Source = { base: string; pattern: string; negated: boolean }
type Compiler = { root: null | "none" | { base: string; pattern: string }; sources: Source[]; build: (candidates: string[]) => string }
type TailwindNode = { compile: (css: string, options: { base: string; onDependency: (path: string) => void }) => Promise<Compiler> }
type TailwindOxide = { Scanner: new (options: { sources: Source[] }) => { scan: () => string[] } }
type Props = Readonly<{ file: string; root: string }>

/** Build a Tailwind entry as @tailwindcss/vite does on a server whose Vite root is `root`: it scans that folder and the entry's own @source lines. */
export async function compileTailwindSheet(props: Props): Promise<string> {
  // the plugin's own compiler and scanner, from where the plugin is installed
  const plugin = createRequire(createRequire(import.meta.url).resolve("@tailwindcss/vite"))
  const node: TailwindNode = plugin("@tailwindcss/node")
  const oxide: TailwindOxide = plugin("@tailwindcss/oxide")
  const compiler = await node.compile(readFileSync(props.file, "utf8"), { base: dirname(props.file), onDependency: () => {} })
  const automatic = compiler.root === "none" ? [] : compiler.root === null ? [{ base: props.root, pattern: "**/*", negated: false }] : [{ ...compiler.root, negated: false }]
  return compiler.build(new oxide.Scanner({ sources: [...automatic, ...compiler.sources] }).scan())
}
