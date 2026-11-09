import { PARTY_MAX } from "#/world/core/party/rules"
import type { Party } from "#/world/core/party/types"

/** 満員かどうかより先に、招待者がリーダーかを調べる。 */
export function getPartyInvitationRejection(party: Pick<Party, "leader" | "members">, owner: string): "NOT_LEADER" | "FULL" | null {
  if (party.leader !== owner) return "NOT_LEADER"
  if (party.members.length >= PARTY_MAX) return "FULL"

  return null
}
