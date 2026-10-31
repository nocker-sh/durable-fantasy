import type { AttackRequestContext } from "#/world/server/map-room/attack-types"
import { Player } from "#/durable-objects/player"
import { getAttackReadiness } from "#/world/core/get-attack-readiness"
import { getAttackBlow } from "#/world/core/get-attack-blow"
import { canReachMonster } from "#/world/server/map-room/can-reach-monster"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { Message } from "#/world/server/map-room/context"
import type { Spawn } from "#/world/core/monster-types"
import type { PreparedMapAttack } from "#/world/server/map-room/attack-types"

type Props = Readonly<{ room: AttackRequestContext; message: Message<"attack">; owner: string; playerId: string; spawn: Spawn }>

/** 保存済みの能力と距離を確認し、立ち上がれた攻撃だけ命中を抽選する。 */
export async function prepareMapAttack(props: Props): Promise<PreparedMapAttack | null> {
  const now = Date.now()
  const saved = await Player.get(props.owner).readCombat()
  const readiness = getAttackReadiness({ player: saved.player, art: props.message.art, struck: props.room.me.struck, now })
  if (readiness.kind === "ignore") return null
  if (readiness.kind === "refused") {
    await notifyClient(props.room.ctx.connection.send({ type: "refused", what: "attack", monster: props.spawn.id, reason: readiness.reason }))
    return null
  }
  if (!canReachMonster(props.room, props.spawn, now)) return null
  if (!(await props.room.standUp())) {
    await notifyClient(props.room.ctx.connection.send({ type: "refused", what: "attack", monster: props.spawn.id, reason: "NOT_READY" }))
    return null
  }
  const hit = getAttackBlow({ stats: readiness.stats, art: readiness.art, monsterKind: props.spawn.kind, random: Math.random })
  return { owner: props.owner, playerId: props.playerId, spawn: props.spawn, now, data: saved.player, life: saved.life, defense: hit.defense, blow: hit.blow }
}
