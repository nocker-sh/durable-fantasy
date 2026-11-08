import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, mergeConfig } from "vite-plus"
import { voidPlugin } from "void"
import { voidReact } from "@void/react/plugin"
import { sharedViteConfig } from "../../vite.shared"

const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url))
const localServer = {
  host: "::1",
  port: Number(process.env.PORT || 5173),
  strictPort: true,
  allowedHosts: ["durable-fantasy"],
}

export default defineConfig(
  mergeConfig(sharedViteConfig, {
    envDir: workspaceRoot,
    plugins: [tailwindcss(), voidPlugin({ persistTo: workspaceRoot + ".void" }), voidReact({ react: { compiler: true } })],
    server: { ...localServer, fs: { allow: [workspaceRoot] }, watch: { ignored: [/\.json$/] }, warmup: { clientFiles: ["./pages/index.tsx"] } },
    preview: { ...localServer, port: Number(process.env.PORT || 4173) },
  }),
)
