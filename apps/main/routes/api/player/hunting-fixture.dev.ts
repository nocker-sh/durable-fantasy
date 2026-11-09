import { z } from "zod"
import { defineHandler } from "void"
import { Player } from "#/durable-objects/player"
import { authenticatedPlayer } from "#/world/server/authenticated-player"
import { sameOrigin } from "#/world/server/same-origin"
import { HUNTING_STAGES } from "#/world/test/hunting-stages"
import { expToNext } from "#/world/core/exp-to-next"
import { STATS, STARTING_POINTS } from "#/world/core/growth-rules"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"

const handler = defineHandler.withValidator({ body: z.object({ level: z.literal([12, 22, 32]), build: z.enum(["sword", "mage"]) }) })

/** Dev-only battle setup for a fresh signed-in test character; it never changes another saved character. */
export const POST = handler(async (context, input) => {
  if (!sameOrigin(context.req.raw)) return new Response("Forbidden", { status: 403 })
  const id = await authenticatedPlayer(context.req.raw)
  if (!id) return new Response("No save in this browser", { status: 404 })
  const actor = Player.get(id)
  const before = await actor.read()
  if (before.level !== 1 || before.exp !== 0 || before.statPoints !== STARTING_POINTS || before.orders.length) return new Response("Fixture requires an unused character", { status: 409 })
  const stage = HUNTING_STAGES.find((entry) => entry.level === input.body.level && entry.build === input.body.build)!
  const exp = Array.from({ length: stage.level - 1 }, (_, index) => expToNext(index + 1)).reduce((sum, amount) => sum + amount, 0)
  const grown = await actor.run({ type: "loot", monster: "development-fixture", exp, items: [] })
  if (!grown.ok) throw Error(grown.reason)
  for (const stat of STATS) {
    for (const index of Array.from({ length: stage.stats[stat] - before.stats[stat] }).keys()) {
      void index
      const raised = await actor.run({ type: "raise", stat })
      if (!raised.ok) throw Error(raised.reason)
    }
  }
  const equipment: readonly ItemId[] = [stage.weapon, "chain-mail", "iron-helm", "wooden-shield"]
  for (const item of equipment) {
    await actor.give(item, 1)
    const saved = await actor.read()
    const slot = saved.bag.findIndex((entry) => entry?.item === item)
    const worn = await actor.run({ type: "equip", slot })
    if (!worn.ok) throw Error(worn.reason)
  }
  await actor.give("herb", 30)
  await actor.give("rye-bread", 10)
  // Level-up refill happened before equipment and stat changes: food and rest remain real operations.
  return { level: stage.level, build: stage.build, weapon: ITEMS[stage.weapon].name }
})
