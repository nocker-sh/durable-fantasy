// The map room's handlers for striking creatures (core/art-swing.ts).
import { Player } from "#/durable-objects/player"
import { Wild } from "#/durable-objects/wild"
import { FIGHT_STAMINA, MELEE_REACH, MONSTER_KINDS } from "#/world/core/monsters"
import { monsterAt } from "#/world/core/monster-at"
import { spawnOf } from "#/world/core/spawn-of"
import { artSwing } from "#/world/core/art-swing"
import { swing } from "#/world/core/swing"
import { isArt } from "#/world/core/is-art"
import { skillOf } from "#/world/core/skill-of"
import { derive } from "#/world/core/derive"
import { walkable } from "#/world/maps/walkable"
import type { Ctx, Handlers, Message } from "#/world/server/map-room/context"
import { reachable } from "#/world/server/map-room/reachable"
import { combatAudience } from "#/world/server/map-room/combat-audience"
import { notifyCombat } from "#/world/server/map-room/notify-combat"
import { notifyClient } from "#/world/server/map-room/notifications"

async function attack(roomCtx: Ctx, message: Message<"attack">) {
  const ctxSource = roomCtx,
    ctx = ctxSource.ctx,
    key = ctxSource.key,
    map = ctxSource.map,
    me = ctxSource.me,
    save = ctxSource.save,
    standUp = ctxSource.standUp
  if (!me.player || !me.owner || me.engaged || me.down || me.trade?.open) return
  const spawn = spawnOf(message.monster)
  if (!spawn || spawn.map !== key.map) return
  const now = Date.now()
  const dataSource = await Player.get(me.owner).readCombat(),
    data = dataSource.player,
    life = dataSource.life
  if (data.hp <= 0) {
    await notifyClient(ctx.connection.send({ type: "refused", what: "attack", monster: spawn.id, reason: "FALLEN" }))
    return
  }
  const d = derive(data)
  const art = message.art ? skillOf(message.art) : null
  if (art && (!isArt(art) || art.kind === "prayer")) return
  // not faster than their attack delay allows (a little slack for the network); an art keeps its own wait
  if (!art && me.struck && now - me.struck < d.attackDelay * 0.85) return
  if (data.stamina < FIGHT_STAMINA) {
    await notifyClient(ctx.connection.send({ type: "refused", what: "attack", monster: spawn.id, reason: "EXHAUSTED" }))
    return
  }
  const at = monsterAt(spawn, now, (x, z) => walkable(map, [Math.floor(x * 2), Math.floor(z * 2)]))
  const here = reachable(me)
  if (!here.some((c) => Math.hypot((c[0] + 0.5) / 2 - at.x, (c[1] + 0.5) / 2 - at.z) <= MELEE_REACH + 0.8)) return
  if (!(await standUp())) {
    await notifyClient(ctx.connection.send({ type: "refused", what: "attack", monster: spawn.id, reason: "NOT_READY" }))
    return
  }
  const kind = MONSTER_KINDS[spawn.kind]
  const them = { atk: 0, def: kind.def, hit: 0, flee: kind.flee, crit: 0 }
  const mine = { atk: d.atk, def: d.def, hit: d.hit, flee: d.flee, crit: d.crit }
  const blow = art && isArt(art) ? artSwing({ art: art, stats: d.stats, attacker: mine, target: them, random: Math.random }) : swing(mine, them, Math.random)
  // the creature is whoever struck it first's to finish (core/wild/hit.ts); a miss still starts the fight
  const wild = Wild.get(ctx.params.mapId)
  const request = await wild.beginStrike({
    target: spawn.id,
    damage: blow.kind === "miss" ? 0 : blow.damage,
    owner: me.owner,
    request: crypto.randomUUID(),
    art: message.art,
    audience: combatAudience({ context: roomCtx, data: data, life: life, defense: mine }),
  })
  if (!request.ok) {
    await notifyClient(ctx.connection.send({ type: "refused", what: "attack", monster: spawn.id, reason: request.reason }))
    return
  }
  const r = await wild.strike(me.owner, request.id)
  if (r.payment) {
    await notifyClient(ctx.connection.send({ type: "result", seq: -1, result: r.payment }))
  }
  if (r.refused) {
    await notifyClient(ctx.connection.send({ type: "refused", what: message.art && r.payment && !r.payment.ok ? "art" : "attack", monster: spawn.id, reason: r.reason ?? "TAKEN" }))
    return
  }
  save({ struck: now })
  await notifyClient(ctx.room.broadcast({ type: "struck", by: me.player.id, monster: spawn.id, swing: blow, hp: r.hp, back: r.back, ...(r.revision !== undefined ? { revision: r.revision } : {}) }))
  const notices = await wild.deliverStrike(me.owner, request.id)
  let own = notices.filter((notice) => notice.owner === me.owner).at(-1)?.result
  if (!own && (r.beaten || (r.counter && r.counter.kind !== "miss"))) {
    // The alarm may have delivered before this RPC. Reconcile current state without replaying events.
    own = { ok: true, state: await Player.get(me.owner).read(), events: [] }
    notices.push({ owner: me.owner, result: own })
  }
  await notifyCombat(roomCtx, notices)
  if (r.counter) {
    const down = !!own?.ok && own.state.hp <= 0
    if (down) save({ down: true, route: [reachable(me).at(-1)!], since: Date.now() })
    await notifyClient(ctx.room.broadcast({ type: "hitback", monster: spawn.id, target: me.player.id, swing: r.counter, down }))
  }
  return
}

export const HANDLERS: Handlers = {
  attack: attack,
}
