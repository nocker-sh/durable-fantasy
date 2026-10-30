import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite-plus"
import type { PluginOption } from "vite"
import { devSourceModules } from "./dev/vite/dev-source-modules"
import { voidPlugin } from "void"
import { voidReact } from "@void/react/plugin"

// Portless supplies HOST and PORT; direct Vite use has a stable local fallback.
const port = Number(process.env.PORT || 5173)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535")
}

const localServer = {
  host: process.env.HOST || "127.0.0.1",
  strictPort: true,
  allowedHosts: ["durable-fantasy.localhost"],
}

export default defineConfig(() => {
  const plugins: PluginOption[] = []
  if (!process.env.VITEST) plugins.push(devSourceModules(fileURLToPath(new URL(".", import.meta.url))), tailwindcss(), voidPlugin(), voidReact({ react: { compiler: true } }))

  return {
    plugins,
    test: {
      include: ["world/**/*.test.ts", "lib/**/*.test.ts", "components/**/*.test.ts", "dev/**/*.test.ts", "scripts/lib/**/*.test.ts"],
      environment: "node",
      maxWorkers: 1,
      isolate: true,
      server: { deps: { inline: ["void"] } },
    },
    // one style everywhere: double quotes, no semicolons, long lines kept as they are written
    fmt: {
      singleQuote: false,
      semi: false,
      printWidth: 200,
      ignorePatterns: [
        "**/*.md",
        ".docs/**",
        "public/**",
        "world/maps/*.json",
        "void.lock.json",
        "pnpm-lock.yaml",
        ".void/**",
        "dist/**",
        "scripts/houses-doc.ts",
        "scripts/items-doc.ts",
        "scripts/people-doc.ts",
      ],
    },
    lint: {
      plugins: ["typescript", "import", "unicorn", "oxc"],
      rules: { "typescript/consistent-type-definitions": ["error", "type"], "import/extensions": ["error", "never", { checkTypeImports: true }] },
      ignorePatterns: [".void/**", "dist/**", "public/**"],
    },
    server: { ...localServer, port, watch: { ignored: [/\.json$/] } },
    preview: { ...localServer, port: process.env.PORT ? port : 4173 },
  }
})
