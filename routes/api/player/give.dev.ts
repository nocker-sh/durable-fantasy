// Dev only: put things in a player's bag (for checks: crafting, selling, eating).
import { z } from "zod"
import { defineHandler } from "void"
import { Player } from "#/durable-objects/player"
import { playerId } from "#/world/core/identity"
import { itemId } from "#/world/core/player-schema"
import { authenticatedPlayer } from "#/world/server/authenticated-player"
import { sameOrigin } from "#/world/server/same-origin"

const handler = defineHandler.withValidator({
  body: z.object({ id: playerId, item: itemId, count: z.number().int().min(1).max(99) }),
})

export const POST = handler(async (context, input) => {
  if (!sameOrigin(context.req.raw) || (await authenticatedPlayer(context.req.raw)) !== input.body.id) return new Response("Forbidden", { status: 403 })
  return Player.get(input.body.id).give(input.body.item, input.body.count)
})
