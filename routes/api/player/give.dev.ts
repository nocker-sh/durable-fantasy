// Dev only: put things in a player's bag (for checks: crafting, selling, eating).
import { z } from "zod"
import { defineHandler } from "void"
import { Player } from "../../../durable-objects/player.ts"
import { playerId } from "#/world/core/identity.ts"
import { itemId } from "#/world/core/player.ts"
import { authenticatedPlayer, sameOrigin } from "#/world/server/session.ts"

export const POST = defineHandler.withValidator({
  body: z.object({ id: playerId, item: itemId, count: z.number().int().min(1).max(99) }),
})(async (_c, { body }) => {
  if (!sameOrigin(_c.req.raw) || (await authenticatedPlayer(_c.req.raw)) !== body.id) return new Response("Forbidden", { status: 403 })
  return Player.get(body.id).give(body.item, body.count)
})
