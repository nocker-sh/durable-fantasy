// The /dev catalog and studio are for development: production answers them with 404.
// (Page files have no environment suffix, so they are built either way; this keeps them unreachable.)
import { defineMiddleware } from "void"

export default defineMiddleware(async (c, next) => {
  if (!import.meta.env.DEV && (c.req.path === "/dev" || c.req.path.startsWith("/dev/"))) return c.notFound()
  await next()
})
