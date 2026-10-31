import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import { derive } from "#/world/core/derive"
import { partyView } from "#/world/server/map-room/party-view"
import { sendPartyChat } from "#/world/server/map-room/send-party-chat"
import { clearPartyMembership } from "#/world/server/map-room/clear-party-membership"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me" | "save"> & { map: Pick<Ctx["map"], "name">; ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "state" | "send"> }> }>

/** 状態と会話を一度の照会で受け取り、名簿と本人の保存済み所属に従って公開する。 */
export async function handlePartyLook(room: Props, message: Message<"party-look">) {
  const me = room.me
  if (!me.owner || !me.player) return
  if (!me.party) return room.ctx.connection.send({ type: "party", view: null })
  const player = await Player.get(me.owner).read()
  const polled = await Party.get(me.party).poll({
    owner: me.owner,
    status: { name: me.player.name, level: player.level, hp: player.hp, maxHp: derive(player).maxHp, map: room.map.name, at: Date.now() },
    after: message.chat?.party === me.party ? message.chat.seq : 0,
  })
  if (!polled.party.members.some((member) => member.owner === me.owner)) return clearPartyMembership(room, me.owner)
  await room.ctx.connection.send({ type: "party", view: partyView(polled.party, me.owner) })
  if (player.party === me.party) await sendPartyChat(room, polled.chat)
}
