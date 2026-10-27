// The map room's handlers for parties (core/party.ts).
import { sendPartyChat } from "./party-chat.ts"
import { Party } from "../../../durable-objects/party.ts"
import { PARTY_MAX } from "../../core/party.ts"
import { Player } from "../../../durable-objects/player.ts"
import { derive } from "../../core/stats.ts"
import type { Ctx, Handlers, Message } from "./context.ts"
import { presence, setPresence, partyView } from "./presence.ts"

async function partyInvite(roomCtx: Ctx, message: Message<"party-invite">) {
  const { ctx, me, save } = roomCtx
  const them = ctx.room.getConnection(message.target)
  const other = them && presence(them)
  if (!me.player || !me.owner || !them || !other?.player || other.party || them.id === ctx.connection.id) {
    await ctx.connection.send({ type: "party-closed", reason: "BUSY" })
    return
  }
  if (me.party) {
    const p = await Party.get(me.party).view()
    if (p.leader !== me.owner) {
      await ctx.connection.send({ type: "party-closed", reason: "NOT_LEADER" })
      return
    }
    if (p.members.length >= PARTY_MAX) {
      await ctx.connection.send({ type: "party-closed", reason: "FULL" })
      return
    }
  }
  save({ inviting: them.id })
  await them.send({ type: "party-invited", from: ctx.connection.id, name: me.player.name })
  return
}

async function partyAnswer(roomCtx: Ctx, message: Message<"party-answer">) {
  const { ctx, map, me, save } = roomCtx
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

async function partyLeave(roomCtx: Ctx, _message: Message<"party-leave">) {
  const { ctx, me, save } = roomCtx
  if (!me.owner || !me.party) return
  await Party.get(me.party).leave(me.owner)
  save({ party: null })
  await ctx.connection.send({ type: "result", seq: -1, result: await Player.get(me.owner).run({ type: "set-party", party: null }) })
  await ctx.connection.send({ type: "party", view: null })
  return
}

async function partyMode(roomCtx: Ctx, message: Message<"party-mode">) {
  const { ctx, me } = roomCtx
  if (!me.owner || !me.party) return
  await ctx.connection.send({ type: "party", view: partyView(await Party.get(me.party).setMode(me.owner, message.mode), me.owner) })
  return
}

async function partyLook(roomCtx: Ctx, message: Message<"party-look">) {
  const { ctx, map, me, save } = roomCtx
  if (!me.owner || !me.player) return
  if (!me.party) {
    await ctx.connection.send({ type: "party", view: null })
    return
  }
  // report how we are, and see how the others are
  const d = await Player.get(me.owner).read()
  const { party: p, chat } = await Party.get(me.party).poll(
    me.owner,
    { name: me.player.name, level: d.level, hp: d.hp, maxHp: derive(d).maxHp, map: map.name, at: Date.now() },
    message.chat?.party === me.party ? message.chat.seq : 0,
  )
  if (!p.members.some((m) => m.owner === me.owner)) {
    // the party broke up while we were away
    save({ party: null })
    await ctx.connection.send({ type: "result", seq: -1, result: await Player.get(me.owner).run({ type: "set-party", party: null }) })
    await ctx.connection.send({ type: "party", view: null })
    return
  }
  await ctx.connection.send({ type: "party", view: partyView(p, me.owner) })
  if (d.party === me.party) await sendPartyChat(roomCtx, chat)
  return
}

export const HANDLERS: Handlers = {
  "party-invite": partyInvite,
  "party-answer": partyAnswer,
  "party-leave": partyLeave,
  "party-mode": partyMode,
  "party-look": partyLook,
}
