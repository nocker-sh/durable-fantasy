// Which channel of a map to join in a parallel town, and how full each one is (game-system.md §1.1).
import { z } from "zod"
import { defineHandler } from "void"
import { WORLDS } from "#/world/channels"
import { isMapId } from "#/world/maps/is-map-id"
import { Directory } from "../../durable-objects/directory"

const whole = z.string().transform(Number).pipe(z.number().int().min(1))
const query = z.object({
  world: z.string().transform(Number).pipe(z.number().int().min(1).max(WORLDS)),
  map: z.string().max(40).refine(isMapId, "no such map"),
  want: whole.optional(),
  friend: whole.optional(),
})

const handler = defineHandler.withValidator({ query })

export const GET = handler(async (_context, input) => {
  const town = Directory.get(`town-${input.query.world}`)
  return { channel: await town.choose({ map: input.query.map, want: input.query.want, friend: input.query.friend }), channels: await town.channels(input.query.map) }
})
