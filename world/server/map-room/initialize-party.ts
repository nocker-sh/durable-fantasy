import { Player } from "#/durable-objects/player"
import { readPartyMember } from "#/world/server/map-room/read-party-member"
import { setPresence } from "#/world/server/map-room/set-presence"
import type { Ctx } from "#/world/server/map-room/context"
import type { PartyJoinContext } from "#/world/server/map-room/party-join-types"

type Props = Readonly<{ context: PartyJoinContext; owner: string; name: string; connection: Pick<Ctx["ctx"]["connection"], "state" | "setState" | "send"> }>

/** 新しいパーティでは招待者を先に登録し、本人へ保存結果を返してから接続の所属を反映する。 */
export async function initializeParty(props: Props): Promise<void> {
  await props.context.party.join(await readPartyMember(props.owner, props.name, props.context.mapName))
  await props.connection.send({ type: "result", seq: -1, result: await Player.get(props.owner).run({ type: "set-party", party: props.context.id }) })
  setPresence(props.connection, { party: props.context.id })
}
