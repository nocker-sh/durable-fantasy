import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import { voidPlugin } from "void";
import { voidReact } from "@void/react/plugin";

// /dev/[sheet] also matches source URLs such as /dev/db.tsx. Let Vite serve those
// modules through its filesystem URL before Void's page routing handles the request.
function devSourceModules(): Plugin {
  const root = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");
  return {
    name: "dev-source-modules",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url && /^\/dev\/.*\.(?:[cm]?[jt]sx?|css)(?:\?|$)/.test(request.url)) request.url = `/@fs${root}${request.url}`;
        next();
      });
    },
  };
}

// Portless supplies HOST and PORT; direct Vite use has a stable local fallback.
const port = Number(process.env.PORT || 5173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const localServer = {
  host: process.env.HOST || "127.0.0.1",
  strictPort: true,
  allowedHosts: ["durable-fantasy.localhost"],
};

export default defineConfig({
  plugins: [devSourceModules(), tailwindcss(), voidPlugin(), voidReact({ react: { compiler: true } })],
  // one style everywhere: double quotes, semicolons, long lines kept as they are written
  fmt: {
    singleQuote: false,
    semi: true,
    printWidth: 200,
    ignorePatterns: [
      "**/*.md",
      ".docs/**",
      "public/**",
      "world/maps/*.json",
      "void.lock.json",
      "package-lock.json",
      ".void/**",
      "dist/**",
      "scripts/houses-doc.ts",
      "scripts/items-doc.ts",
      "scripts/people-doc.ts",
    ],
  },
  lint: {
    ignorePatterns: [".void/**", "dist/**", "public/**"],
  },
  server: { ...localServer, port },
  preview: { ...localServer, port: process.env.PORT ? port : 4173 },
});
