import type { AttackRequestContext } from "#/world/server/map-room/attack-types"
import { Wild } from "#/durable-objects/wild"
import { combatAudience } from "#/world/server/map-room/combat-audience"
import { notifyClient } from "#/world/server/map-room/notifications"
import { publishMapStrike } from "#/world/server/map-room/publish-map-strike"
import type { Message } from "#/world/server/map-room/context"
import type { PreparedMapAttack } from "#/world/server/map-room/attack-types"

/** 外れでも占有を予約し、保存先が受け付けた要求だけ支払と命中へ進める。 */
export async function executeMapAttack(room: AttackRequestContext, message: Message<"attack">, attack: PreparedMapAttack): Promise<void> {
  const wild = Wild.get(room.ctx.params.mapId)
  const request = await wild.beginStrike({
    target: attack.spawn.id,
    damage: attack.blow.kind === "miss" ? 0 : attack.blow.damage,
    owner: attack.owner,
    request: crypto.randomUUID(),
    art: message.art,
    audience: combatAudience({ context: room, data: attack.data, life: attack.life, defense: attack.defense }),
  })
  if (!request.ok) {
    await notifyClient(room.ctx.connection.send({ type: "refused", what: "attack", monster: attack.spawn.id, reason: request.reason }))
    return
  }
  const result = await wild.strike(attack.owner, request.id)
  await publishMapStrike({ room, message, attack, wild, id: request.id, result })
}
