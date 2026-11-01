import { Party } from "#/durable-objects/party"
import { partyView } from "#/world/server/map-room/party-view"
import { clearPartyMembership } from "#/world/server/map-room/clear-party-membership"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me" | "save"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "send"> }> }>

/**
 * リーダーが名簿の一人を外すか、リーダーを任せる。仲間は ID を知らないので、名簿の位置と名前で指し、
 * 両方が今の名簿と合うときだけ保存先へ頼む。外された人は次の様子の問い合わせで所属が消える。
 */
export async function handlePartyMember(roomCtx: Props, message: Message<"party-kick"> | Message<"party-lead">) {
  const me = roomCtx.me
  if (!me.owner || !me.party) return
  const party = Party.get(me.party)
  const target = (await party.view()).members[message.member]
  if (!target || target.name !== message.name) return roomCtx.ctx.connection.send({ type: "party-closed", reason: "CHANGED" })
  const input = { leader: me.owner, target: target.owner }
  const next = message.type === "party-kick" ? await party.kick(input) : await party.promote(input)
  if (!next) return roomCtx.ctx.connection.send({ type: "party-closed", reason: "NOT_LEADER" })
  // removing the only other member leaves no party
  if (!next.members.some((member) => member.owner === me.owner)) return clearPartyMembership(roomCtx, me.owner)
  await roomCtx.ctx.connection.send({ type: "party", view: partyView(next, me.owner) })
}
