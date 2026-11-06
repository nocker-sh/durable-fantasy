import { Player } from "#/durable-objects/player"
import { readPartyMember } from "#/world/server/map-room/read-party-member"
import { setPresence } from "#/world/server/map-room/set-presence"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { Ctx } from "#/world/server/map-room/context"
import type { PartyJoinContext } from "#/world/server/map-room/party-join-types"

type Props = Readonly<{ context: PartyJoinContext; owner: string; name: string; connection: Pick<Ctx["ctx"]["connection"], "state" | "setState" | "send"> }>

/** 新しいパーティでは招待者を先に登録し、接続の所属を反映してから保存結果を通知する。 */
export async function initializeParty(props: Props): Promise<void> {
  await props.context.party.join(await readPartyMember(props.owner, props.name, props.context.mapName))
  const result = await Player.get(props.owner).run({ type: "set-party", party: props.context.id })
  setPresence(props.connection, { party: props.context.id })
  await notifyClient(props.connection.send({ type: "result", seq: -1, result }))
}
