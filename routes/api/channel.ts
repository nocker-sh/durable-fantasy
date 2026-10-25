// Which channel of a map to join in a parallel town, and how full each one is (game-system.md §1.1).
import * as v from "valibot";
import { defineHandler } from "void";
import { WORLDS } from "#/world/channels.ts";
import { isMapId } from "#/world/maps/index.ts";
import { Directory } from "../../durable-objects/directory.ts";

const query = v.object({
  world: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1), v.maxValue(WORLDS)),
  map: v.pipe(v.string(), v.maxLength(40), v.check(isMapId, "no such map")),
  want: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1))),
  friend: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1))),
});

export const GET = defineHandler.withValidator({ query })(async (_c, { query: q }) => {
  const town = Directory.get(`town-${q.world}`);
  return { channel: await town.choose(q.map, q.want, q.friend), channels: await town.channels(q.map) };
});
