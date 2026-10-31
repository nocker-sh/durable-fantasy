import { Player } from "#/durable-objects/player"
import { derive } from "#/world/core/derive"
import type { Member } from "#/world/core/party/types"

/** 加入する時点の保存済みの能力値で名簿を作り、接続に残った古い HP を使わない。 */
export async function readPartyMember(owner: string, name: string, mapName: string): Promise<Member> {
  const player = await Player.get(owner).read()
  return { owner, name, level: player.level, hp: player.hp, maxHp: derive(player).maxHp, map: mapName, at: Date.now() }
}
