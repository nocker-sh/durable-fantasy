import type { Fighter } from "#/world/core/combat-types"
import type { PlayerState } from "#/world/core/player-types"
import type { CombatAudience } from "#/world/server/combat-plan"
import type { Ctx } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"

type Props = {
  context: Pick<Ctx, "ctx" | "me">
  data: Pick<PlayerState, "party" | "level">
  life: number
  defense: Fighter
}

export function combatAudience(props: Props): CombatAudience {
  const ctx = props.context.ctx
  const me = props.context.me

  const party = me.party && me.party === props.data.party ? me.party : null
  const near = new Set<string>()
  if (party) {
    for (const connection of ctx.room.getConnections()) {
      const p = presence(connection)
      if (p.owner && p.owner !== me.owner && !p.closed && !p.down && p.party === party) near.add(p.owner)
    }
  }
  return { party, near: [...near], level: props.data.level, life: props.life, defense: props.defense }
}
