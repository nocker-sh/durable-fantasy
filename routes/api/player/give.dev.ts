// Dev only: put things in a player's bag (for checks: crafting, selling, eating).
import * as v from "valibot";
import { defineHandler } from "void";
import { Player } from "../../../durable-objects/player.ts";
import { playerId } from "#/world/core/identity.ts";
import { itemId } from "#/world/core/player.ts";

export const POST = defineHandler.withValidator({
  body: v.object({ id: playerId, item: itemId, count: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(99)) }),
})(async (_c, { body }) => {
  return Player.get(body.id).give(body.item, body.count);
});
