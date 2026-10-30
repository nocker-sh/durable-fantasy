import { normalizePath, type Plugin } from "vite"

/** Serve development source modules before the dynamic page route handles their URLs. */
export function devSourceModules(rootPath: string): Plugin {
  const root = normalizePath(rootPath).replace(/\/$/, "")
  return {
    name: "dev-source-modules",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url && /^\/dev\/.*\.(?:[cm]?[jt]sx?|css)(?:\?|$)/.test(request.url)) request.url = `/@fs/${root}${request.url}`
        next()
      })
    },
  }
}
