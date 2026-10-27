// The map room's handlers for striking creatures (core/combat.ts).
import { Player } from "../../../durable-objects/player.ts"
import { Wild } from "../../../durable-objects/wild.ts"
import { FIGHT_STAMINA, MELEE_REACH, MONSTER_KINDS, monsterAt, spawnOf } from "../../core/monsters.ts"
import { artSwing, swing } from "../../core/combat.ts"
import { isArt, skillOf } from "../../core/skills.ts"
import { derive } from "../../core/stats.ts"
import { walkable } from "../../maps/index.ts"
import type { Ctx, Handlers, Message } from "./context.ts"
import { reachable } from "./presence.ts"
import { awardDefeat } from "./combat-rewards.ts"
import { notifyClient } from "./notifications.ts"

async function attack(roomCtx: Ctx, message: Message<"attack">) {
  const { ctx, key, map, me, save, standUp } = roomCtx
  if (!me.player || !me.owner || me.engaged || me.down || me.trade?.open) return
  const spawn = spawnOf(message.monster)
  if (!spawn || spawn.map !== key.map) return
  const now = Date.now()
  let data = await Player.get(me.owner).read()
  if (data.hp <= 0) {
    await notifyClient(ctx.connection.send({ type: "refused", what: "attack", reason: "FALLEN" }))
    return
  }
  const d = derive(data)
  const art = message.art ? skillOf(message.art) : null
  if (art && (!isArt(art) || art.kind === "prayer")) return
  // not faster than their attack delay allows (a little slack for the network); an art keeps its own wait
  if (!art && me.struck && now - me.struck < d.attackDelay * 0.85) return
  if (data.stamina < FIGHT_STAMINA) {
    await notifyClient(ctx.connection.send({ type: "refused", what: "attack", reason: "EXHAUSTED" }))
    return
  }
  const at = monsterAt(spawn, now, (x, z) => walkable(map, [Math.floor(x * 2), Math.floor(z * 2)]))
  const here = reachable(me)
  if (!here.some((c) => Math.hypot((c[0] + 0.5) / 2 - at.x, (c[1] + 0.5) / 2 - at.z) <= MELEE_REACH + 0.8)) return
  const kind = MONSTER_KINDS[spawn.kind]
  const them = { atk: 0, def: kind.def, hit: 0, flee: kind.flee, crit: 0 }
  const mine = { atk: d.atk, def: d.def, hit: d.hit, flee: d.flee, crit: d.crit }
  const blow = art && isArt(art) ? artSwing(art, d.stats, mine, them, Math.random) : swing(mine, them, Math.random)
  // the creature is whoever struck it first's to finish (core/wild.ts); a miss still starts the fight
  const r = await Wild.get(ctx.params.mapId).strike(spawn.id, blow.kind === "miss" ? 0 : blow.damage, me.owner, message.art)
  if (r.payment) {
    await notifyClient(ctx.connection.send({ type: "result", seq: -1, result: r.payment }))
    if (r.payment.ok) data = r.payment.state
  }
  if (r.refused) {
    await notifyClient(ctx.connection.send({ type: "refused", what: r.payment && !r.payment.ok ? "art" : "attack", reason: r.reason ?? "TAKEN" }))
    return
  }
  save({ struck: now })
  await standUp()
  await notifyClient(ctx.room.broadcast({ type: "struck", by: me.player.id, monster: spawn.id, swing: blow, hp: r.hp, back: r.back }))
  if (r.beaten) {
    await awardDefeat(roomCtx, me.owner, data, spawn.id, kind)
    return
  }
  // struck, it strikes back (a hare only runs)
  if (kind.atk > 0) {
    const back = swing({ atk: kind.atk, def: kind.def, hit: kind.hit, flee: kind.flee, crit: 0 }, { atk: d.atk, def: d.def, hit: d.hit, flee: d.flee, crit: d.crit }, Math.random)
    let down = false
    if (back.kind !== "miss") {
      const result = await Player.get(me.owner).run({ type: "hurt", amount: back.damage, by: kind.name })
      await notifyClient(ctx.connection.send({ type: "result", seq: -1, result }))
      down = result.ok && result.state.hp <= 0
      if (down) save({ down: true, route: [reachable(me).at(-1)!], since: Date.now() })
    }
    await notifyClient(ctx.room.broadcast({ type: "hitback", monster: spawn.id, target: me.player.id, swing: back, down }))
  }
  return
}

export const HANDLERS: Handlers = {
  attack: attack,
}
