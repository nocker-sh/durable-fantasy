import { cellsReached } from "#/world/cells-reached"
import { cellDistance } from "#/world/maps/cell-distance"
import { HEARING_CELLS } from "#/world/protocol"
import type { Fighter } from "#/world/core/combat-types"
import type { PlayerState } from "#/world/core/player-types"
import type { CombatAudience } from "#/world/server/combat-plan"
import type { Ctx } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"
import { reachable } from "#/world/server/map-room/reachable"

type Props = {
  context: { me: Pick<Ctx["me"], "owner" | "party" | "route" | "since">; ctx: { room: { getConnections(): Iterable<Pick<Ctx["ctx"]["connection"], "state">> } } }
  data: Pick<PlayerState, "party" | "level">
  life: number
  defense: Fighter
}

/** 分配先の候補は、同じ部屋で倒した人の声が届く範囲にいる仲間に限る（game-system.md §10）。 */
export function combatAudience(props: Props): CombatAudience {
  const ctx = props.context.ctx
  const me = props.context.me

  const party = me.party && me.party === props.data.party ? me.party : null
  const near = new Set<string>()
  const origin = party ? cellsReached(me.route, (Date.now() - me.since) / 1000)[0] : undefined
  if (party && origin) {
    for (const connection of ctx.room.getConnections()) {
      const p = presence(connection)
      if (!p.owner || p.owner === me.owner || p.closed || p.down || p.party !== party) continue
      if (reachable(p).some((cell) => cellDistance(cell, origin) <= HEARING_CELLS)) near.add(p.owner)
    }
  }
  return { party, near: [...near], level: props.data.level, life: props.life, defense: props.defense }
}
