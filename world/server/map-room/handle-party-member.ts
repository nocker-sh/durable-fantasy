import { Party } from "#/durable-objects/party"
import { sendPartyView } from "#/world/server/map-room/send-party-view"
import { presence } from "#/world/server/map-room/presence"
import { clearPartyMembership } from "#/world/server/map-room/clear-party-membership"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me" | "save"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "id" | "state" | "setState" | "send"> }> }>

/**
 * 名簿の選択印を接続内の本人と照合し、同名の別人への入れ替わりを断る。権限は保存先が判定する。
 */
export async function handlePartyMember(roomCtx: Props, message: Message<"party-kick"> | Message<"party-lead">) {
  const me = roomCtx.me
  if (!me.owner || !me.party) return
  const party = Party.get(me.party)
  const target = (await party.view()).members[message.member]
  if (!target || target.name !== message.name) return roomCtx.ctx.connection.send({ type: "party-closed", reason: "CHANGED" })
  const selection = presence(roomCtx.ctx.connection).partySelection
  const selected = selection?.members.find((member) => member.key === message.key)
  if (selection?.connection !== roomCtx.ctx.connection.id || selection.owner !== me.owner || selection.party !== me.party || selected?.owner !== target.owner)
    return roomCtx.ctx.connection.send({ type: "party-closed", reason: "CHANGED" })
  const input = { leader: me.owner, target: target.owner }
  const next = message.type === "party-kick" ? await party.kick(input) : await party.promote(input)
  if (!next) return roomCtx.ctx.connection.send({ type: "party-closed", reason: "NOT_LEADER" })
  // removing the only other member leaves no party
  if (!next.members.some((member) => member.owner === me.owner)) return clearPartyMembership(roomCtx, me.owner)
  await sendPartyView({ connection: roomCtx.ctx.connection, party: next, partyId: me.party, owner: me.owner })
}
