import { emptyParty } from "#/world/core/party/empty-party"
import type { Party } from "#/world/core/party/types"

/** Someone leaves; the next one in leads if it was the leader. A party of one is no party. */
export function leave(party: Party, owner: string): Party {
  const members = party.members.filter((member) => member.owner !== owner)
  if (members.length < 2) return emptyParty()
  return { ...party, members, leader: party.leader === owner ? members[0].owner : party.leader }
}
