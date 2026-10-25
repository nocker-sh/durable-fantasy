// Which channel of a map to join in a parallel town, and how full each one is (game-system.md §1.1).
import { z } from "zod"
import { defineHandler } from "void"
import { WORLDS } from "#/world/channels.ts"
import { isMapId } from "#/world/maps/index.ts"
import { Directory } from "../../durable-objects/directory.ts"

const whole = z.string().transform(Number).pipe(z.number().int().min(1))
const query = z.object({
  world: z.string().transform(Number).pipe(z.number().int().min(1).max(WORLDS)),
  map: z.string().max(40).refine(isMapId, "no such map"),
  want: whole.optional(),
  friend: whole.optional(),
})

export const GET = defineHandler.withValidator({ query })(async (_c, { query: q }) => {
  const town = Directory.get(`town-${q.world}`)
  return { channel: await town.choose(q.map, q.want, q.friend), channels: await town.channels(q.map) }
})
