// Dev only: start a player over as a new traveller (the debug panel's reset button).
import * as v from "valibot";
import { defineHandler } from "void";
import { Player } from "../../../durable-objects/player.ts";
import { playerId } from "#/world/core/identity.ts";

export const POST = defineHandler.withValidator({
  body: v.object({ id: playerId }),
})(async (_c, { body }) => {
  return Player.get(body.id).reset();
});
