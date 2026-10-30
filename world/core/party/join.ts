import { PARTY_MAX } from "#/world/core/party/rules"
import type { Party, Member } from "#/world/core/party/types"

/** 最初の人をリーダーにし、加入済みなら状態を保つ。満員の新規加入だけを断る。 */
export function join(party: Party, member: Member): Party | null {
  if (party.members.some((candidate) => candidate.owner === member.owner)) return party
  if (party.members.length >= PARTY_MAX) return null
  return { ...party, leader: party.leader || member.owner, members: [...party.members, member] }
}
