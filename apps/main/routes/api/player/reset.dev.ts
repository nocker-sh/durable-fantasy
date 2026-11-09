// Dev only: start the signed-in player over as a new traveller (the debug panel).
// Their character goes back to the creation screen, and their exchange orders and inbox are dropped.
import { z } from "zod"
import { defineHandler } from "void"
import { Exchange } from "#/durable-objects/exchange"
import { Player } from "#/durable-objects/player"
import { playerId } from "#/world/core/identity"
import { authenticatedPlayer } from "#/world/server/authenticated-player"
import { sameOrigin } from "#/world/server/same-origin"

const handler = defineHandler.withValidator({
  body: z.object({ id: playerId.optional() }),
})

export const POST = handler(async (context, input) => {
  if (!sameOrigin(context.req.raw)) return new Response("Forbidden", { status: 403 })
  const id = await authenticatedPlayer(context.req.raw)
  if (!id) return new Response("No save in this browser", { status: 404 })
  if (input.body.id && input.body.id !== id) return new Response("Forbidden", { status: 403 })
  const player = await Player.get(id).reset()
  await Exchange.get("world").forget(id)
  return player
})
