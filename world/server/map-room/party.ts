import { handlePartyMode } from "#/world/server/map-room/handle-party-mode"
import { handlePartyLeave } from "#/world/server/map-room/handle-party-leave"
import { handlePartyInvite } from "#/world/server/map-room/handle-party-invite"
// The map room's handlers for parties (core/party.ts).
import { handlePartyLook } from "#/world/server/map-room/handle-party-look"
import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import { derive } from "#/world/core/derive"
import type { Ctx, Handlers, Message } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"
import { setPresence } from "#/world/server/map-room/set-presence"
import { partyView } from "#/world/server/map-room/party-view"

async function partyAnswer(roomCtx: Ctx, message: Message<"party-answer">) {
  const ctxSource2 = roomCtx,
    ctx = ctxSource2.ctx,
    map = ctxSource2.map,
    me = ctxSource2.me,
    save = ctxSource2.save
  const them = ctx.room.getConnection(message.from)
  const other = them && presence(them)
  if (!me.player || !me.owner || !them || !other?.owner || !other.player || other.inviting !== ctx.connection.id) return
  setPresence(them, { inviting: undefined })
  if (!message.yes || me.party) {
    await them.send({ type: "party-closed", reason: "DECLINED" })
    return
  }
  const id = other.party ?? crypto.randomUUID()
  const party = Party.get(id)
  const member = async (owner: string, name: string) => {
    const d = await Player.get(owner).read()
    return { owner, name, level: d.level, hp: d.hp, maxHp: derive(d).maxHp, map: map.name, at: Date.now() }
  }
  if (!other.party) {
    await party.join(await member(other.owner, other.player.name))
    await them.send({ type: "result", seq: -1, result: await Player.get(other.owner).run({ type: "set-party", party: id }) })
    setPresence(them, { party: id })
  }
  if (!(await party.join(await member(me.owner, me.player.name)))) {
    await ctx.connection.send({ type: "party-closed", reason: "FULL" })
    return
  }
  await ctx.connection.send({ type: "result", seq: -1, result: await Player.get(me.owner).run({ type: "set-party", party: id }) })
  save({ party: id })
  await ctx.connection.send({ type: "party", view: partyView(await party.view(), me.owner) })
  await them.send({ type: "party", view: partyView(await party.view(), other.owner) })
  return
}

export const HANDLERS: Handlers = {
  "party-invite": handlePartyInvite,
  "party-answer": partyAnswer,
  "party-leave": handlePartyLeave,
  "party-mode": handlePartyMode,
  "party-look": handlePartyLook,
}
