// Unit tests for the pure game core run in Node, without the Workers runtime the app plugin sets up.
import { defineConfig } from "vite-plus"

export default defineConfig({
  test: {
    include: ["world/**/*.test.ts", "lib/**/*.test.ts", "components/**/*.test.ts", "dev/**/*.test.ts"],
    environment: "node",
    // Transform Void so participant tests can replace only the Workers host base class.
    server: { deps: { inline: ["void"] } },
  },
})
