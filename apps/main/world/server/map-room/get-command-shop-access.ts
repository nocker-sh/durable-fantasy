import { shopOf } from "#/world/core/commands"
import { TALK_CELLS } from "#/world/maps"
import { keepersOnDuty } from "#/world/maps/keepers-on-duty"
import { shopOpen } from "#/world/maps/shop-open"
import { timeFor } from "#/world/server/map-room/time-for"
import { near } from "#/world/server/map-room/near"
import type { Command } from "#/world/core/commands"
import type { Transition } from "#/world/core/transition"
import type { PlayerCommandContext } from "#/world/server/map-room/player-command-types"

type Access = { ok: true; keepers: string[] | null } | Extract<Transition, { ok: false }>

/** Only keepers at their post on this map serve and receive familiarity; opening is checked before proximity. */
export function getCommandShopAccess(context: Pick<PlayerCommandContext, "map" | "me">, command: Command): Access {
  const shop = shopOf(command)
  if (!shop) return { ok: true, keepers: null }
  const minute = timeFor(context.me)
  if (!shopOpen(shop, minute)) return { ok: false, reason: "CLOSED" }
  // a keeper off duty elsewhere on the same map neither serves nor gains familiarity (economy.md §6)
  const present = keepersOnDuty(context.map, shop, minute)
  if (!present.some((keeper) => near(context.me, keeper.cell, TALK_CELLS + 1))) return { ok: false, reason: "TOO_FAR" }
  return { ok: true, keepers: present.map((keeper) => keeper.name) }
}
