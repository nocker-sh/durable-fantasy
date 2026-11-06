import { Party } from "#/durable-objects/party"
import { presence } from "#/world/server/map-room/presence"
import { setPresence } from "#/world/server/map-room/set-presence"
import { partyView } from "#/world/server/map-room/party-view"
import { initializeParty } from "#/world/server/map-room/initialize-party"
import { joinPartyMember } from "#/world/server/map-room/join-party-member"
import { getPartyInvitationRejection } from "#/world/server/map-room/get-party-invitation-rejection"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Connection = Pick<Ctx["ctx"]["connection"], "id" | "state" | "setState" | "send">
type Props = Readonly<
  Pick<Ctx, "me" | "save"> & { map: Pick<Ctx["map"], "name">; ctx: Readonly<{ connection: Pick<Connection, "id" | "send">; room: Readonly<{ getConnection(id: string): Connection | undefined }> }> }
>

/** 招待を消費してから受諾を処理し、招待者がまだリーダーで空きがあるときだけ、新規の招待者、返答者の順に所属を登録する。 */
export async function handlePartyAnswer(room: Props, message: Message<"party-answer">) {
  const me = room.me
  const connection = room.ctx.connection
  const peer = room.ctx.room.getConnection(message.from)
  const other = peer && presence(peer)
  if (!me.player || !me.owner || !peer || !other?.owner || !other.player || other.inviting !== connection.id) return
  setPresence(peer, { inviting: undefined })
  if (!message.yes || me.party) return peer.send({ type: "party-closed", reason: "DECLINED" })
  const id = other.party ?? crypto.randomUUID()
  const party = Party.get(id)
  const context = { id, mapName: room.map.name, party }
  // the lead may have passed on, or the party filled, since the invitation was sent
  const rejection = other.party ? getPartyInvitationRejection(await party.view(), other.owner) : null
  if (rejection) {
    await peer.send({ type: "party-closed", reason: rejection })
    return connection.send({ type: "party-closed", reason: rejection === "FULL" ? "FULL" : "CHANGED" })
  }
  if (!other.party) await initializeParty({ context, owner: other.owner, name: other.player.name, connection: peer })
  if (!(await joinPartyMember({ context, owner: me.owner, name: me.player.name, room }))) return
  const mine = partyView(await party.view(), me.owner)
  await notifyClient(connection.send({ type: "party", view: mine }))
  const theirs = partyView(await party.view(), other.owner)
  await notifyClient(peer.send({ type: "party", view: theirs }))
}
