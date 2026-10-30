// Dev only: start a player over as a new traveller (the debug panel's reset button).
import { z } from "zod"
import { defineHandler } from "void"
import { Player } from "#/durable-objects/player"
import { playerId } from "#/world/core/identity"
import { authenticatedPlayer } from "#/world/server/authenticated-player"
import { sameOrigin } from "#/world/server/same-origin"

const handler = defineHandler.withValidator({
  body: z.object({ id: playerId }),
})

export const POST = handler(async (context, input) => {
  if (!sameOrigin(context.req.raw) || (await authenticatedPlayer(context.req.raw)) !== input.body.id) return new Response("Forbidden", { status: 403 })
  return Player.get(input.body.id).reset()
})
