import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, mergeConfig } from "vite-plus"
import { voidPlugin } from "void"
import { voidReact } from "@void/react/plugin"
import { sharedViteConfig } from "../../vite.shared"
import { devSourceModules } from "./dev/vite/dev-source-modules"

const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url))
const localServer = {
  host: "::1",
  port: Number(process.env.PORT || 5173),
  strictPort: true,
  allowedHosts: ["dev.durable-fantasy"],
}

export default defineConfig(
  mergeConfig(sharedViteConfig, {
    plugins: [devSourceModules(fileURLToPath(new URL(".", import.meta.url)), workspaceRoot + "public"), tailwindcss(), voidPlugin(), voidReact({ react: { compiler: true } })],
    server: { ...localServer, fs: { allow: [workspaceRoot] }, watch: { ignored: [/\.json$/] }, warmup: { clientFiles: ["./pages/layout.tsx", "./pages/index.tsx", "./pages/view.tsx"] } },
    preview: { ...localServer, port: Number(process.env.PORT || 4173) },
  }),
)
