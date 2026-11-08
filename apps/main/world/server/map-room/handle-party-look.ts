import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import { derive } from "#/world/core/derive"
import { PARTY_LOOK_GAP_MS } from "#/world/core/pace-rules"
import { sendPartyView } from "#/world/server/map-room/send-party-view"
import { sendPartyChat } from "#/world/server/map-room/send-party-chat"
import { clearPartyMembership } from "#/world/server/map-room/clear-party-membership"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me" | "save"> & { map: Pick<Ctx["map"], "name">; ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "id" | "state" | "setState" | "send"> }> }>

/** 状態と会話を一度の照会で受け取り、名簿と本人の保存済み所属に従って公開する。 */
export async function handlePartyLook(room: Props, message: Message<"party-look">) {
  const me = room.me
  if (!me.owner || !me.player) return
  if (!me.party) return room.ctx.connection.send({ type: "party", view: null })
  const now = Date.now()
  if (me.lookedAt !== undefined && now - me.lookedAt < PARTY_LOOK_GAP_MS) return
  room.save({ lookedAt: now })
  const player = await Player.get(me.owner).read()
  const polled = await Party.get(me.party).poll({
    owner: me.owner,
    status: { name: me.player.name, level: player.level, hp: player.hp, maxHp: derive(player).maxHp, map: room.map.name, at: now },
    after: message.chat?.party === me.party ? message.chat.seq : 0,
  })
  if (!polled.party.members.some((member) => member.owner === me.owner)) return clearPartyMembership(room, me.owner)
  await sendPartyView({ connection: room.ctx.connection, party: polled.party, partyId: me.party, owner: me.owner })
  if (player.party === me.party) await sendPartyChat(room, polled.chat)
}
