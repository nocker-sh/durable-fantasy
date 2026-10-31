import { Player } from "#/durable-objects/player"
import { readPartyMember } from "#/world/server/map-room/read-party-member"
import type { Ctx } from "#/world/server/map-room/context"
import type { PartyJoinContext } from "#/world/server/map-room/party-join-types"

type Props = Readonly<{ context: PartyJoinContext; owner: string; name: string; room: Pick<Ctx, "save"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "send"> }> } }>

/** 名簿が受け付けた場合だけ本人の所属を保存し、満員なら接続の所属を変えない。 */
export async function joinPartyMember(props: Props): Promise<boolean> {
  if (!(await props.context.party.join(await readPartyMember(props.owner, props.name, props.context.mapName)))) {
    await props.room.ctx.connection.send({ type: "party-closed", reason: "FULL" })
    return false
  }
  await props.room.ctx.connection.send({ type: "result", seq: -1, result: await Player.get(props.owner).run({ type: "set-party", party: props.context.id }) })
  props.room.save({ party: props.context.id })
  return true
}
