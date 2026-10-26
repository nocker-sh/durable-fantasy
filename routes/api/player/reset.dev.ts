// Dev only: start a player over as a new traveller (the debug panel's reset button).
import { z } from "zod"
import { defineHandler } from "void"
import { Player } from "../../../durable-objects/player.ts"
import { playerId } from "#/world/core/identity.ts"
import { authenticatedPlayer, sameOrigin } from "#/world/server/session.ts"

export const POST = defineHandler.withValidator({
  body: z.object({ id: playerId }),
})(async (_c, { body }) => {
  if (!sameOrigin(_c.req.raw) || (await authenticatedPlayer(_c.req.raw)) !== body.id) return new Response("Forbidden", { status: 403 })
  return Player.get(body.id).reset()
})
