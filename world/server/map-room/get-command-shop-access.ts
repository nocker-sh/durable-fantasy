import { shopOf } from "#/world/core/commands"
import { SHOPS } from "#/world/core/shops"
import { TALK_CELLS } from "#/world/maps"
import { npcCell } from "#/world/maps/npc-cell"
import { shopOpen } from "#/world/maps/shop-open"
import { timeFor } from "#/world/server/map-room/time-for"
import { near } from "#/world/server/map-room/near"
import type { Command } from "#/world/core/commands"
import type { Transition } from "#/world/core/transition"
import type { Ctx } from "#/world/server/map-room/context"

type Access = { ok: true; keepers: string[] | null } | Extract<Transition, { ok: false }>

/** Only keepers currently at the counter receive familiarity; opening is checked before proximity. */
export function getCommandShopAccess(context: Pick<Ctx, "map" | "me">, command: Command): Access {
  const shop = shopOf(command)
  if (!shop) return { ok: true, keepers: null }
  const present = SHOPS[shop].keepers.flatMap((name) => {
    const cell = npcCell(context.map, name, timeFor(context.me))
    return cell ? [{ name, cell }] : []
  })
  const keepers = present.map((keeper) => keeper.name)
  if (!shopOpen(shop, timeFor(context.me))) return { ok: false, reason: "CLOSED" }
  if (!present.some((keeper) => near(context.me, keeper.cell, TALK_CELLS + 1))) return { ok: false, reason: "TOO_FAR" }
  return { ok: true, keepers }
}
