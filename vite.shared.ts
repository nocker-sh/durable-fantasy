import type { UserConfig } from "vite-plus"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const manifest: { imports: Record<string, string> } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

const workspaceRoot = fileURLToPath(new URL(".", import.meta.url))

export const sharedViteConfig: UserConfig = {
  optimizeDeps: {
    // @void/react stays out: its plugin keeps it unbundled so pages share the router's context (useParams)
    include: [
      "@base-ui/react/button",
      "@base-ui/react/collapsible",
      "@base-ui/react/dialog",
      "@base-ui/react/input",
      "@base-ui/react/menu",
      "@base-ui/react/merge-props",
      "@base-ui/react/progress",
      "@base-ui/react/separator",
      "@base-ui/react/slider",
      "@base-ui/react/switch",
      "@base-ui/react/tabs",
      "@base-ui/react/tooltip",
      "@base-ui/react/use-render",
      "class-variance-authority",
      "cn",
      "lucide-react",
      "react",
      "react-dom/client",
      "react/jsx-dev-runtime",
      "react/jsx-runtime",
      "three",
      "void/pages-prefetch",
      "void/ws",
      "zod",
    ],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    tsconfigPaths: true,
    alias: [
      ...Object.entries(manifest.imports)
        .filter(([name]) => name.startsWith("#resources/"))
        .map(([find, target]) => ({
          find,
          replacement: target.startsWith("./") ? fileURLToPath(new URL(target, import.meta.url)) : target,
        })),
      { find: "/world", replacement: workspaceRoot + "apps/main/world" },
      { find: "/scripts", replacement: workspaceRoot + "scripts" },
    ],
  },
  publicDir: workspaceRoot + "public",
  test: {
    include: ["apps/main/world/**/*.test.ts", "lib/**/*.test.ts", "apps/main/components/**/*.test.ts", "apps/studio/dev/**/*.test.ts", "scripts/lib/**/*.test.ts"],
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
      "apps/main/world/maps/*.json",
      "void.lock.json",
      "pnpm-lock.yaml",
      "**/.void/**",
      "**/dist/**",
      "scripts/houses-doc.ts",
      "scripts/items-doc.ts",
      "scripts/people-doc.ts",
    ],
  },
  lint: {
    plugins: ["typescript", "import", "unicorn", "oxc"],
    rules: { "typescript/consistent-type-definitions": ["error", "type"], "import/extensions": ["error", "never", { checkTypeImports: true }] },
    ignorePatterns: ["**/.void/**", "**/dist/**", "public/**"],
  },
}
