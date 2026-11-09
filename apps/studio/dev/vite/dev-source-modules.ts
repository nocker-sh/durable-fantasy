import { normalizePath, type Plugin } from "vite"

/**
 * Serve the studio's own source modules (pages/ and dev/), and the pictures in public/dev
 * (scripts/shoot-maps.ts), before the dynamic page routes (/[sheet], /[sheet]/[id]) take their URLs:
 * /pages/layout.tsx would otherwise be answered as the sheet "pages", item "layout.tsx".
 */
export function devSourceModules(rootPath: string, publicPath: string): Plugin {
  const root = normalizePath(rootPath).replace(/\/$/, "")
  return {
    name: "dev-source-modules",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url && /^\/(?:dev|pages)\/.*\.(?:[cm]?[jt]sx?|css)(?:\?|$)/.test(request.url)) request.url = `/@fs/${root}${request.url}`
        else if (request.url && /^\/dev\/.*\.(?:jpe?g|png|webp)(?:\?|$)/.test(request.url)) request.url = `/@fs/${normalizePath(publicPath)}${request.url}`
        next()
      })
    },
  }
}
