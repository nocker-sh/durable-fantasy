import type { Party, Member } from "#/world/core/party/types"

/** 同じ所有者の報告だけを置き換え、名簿にいない人を報告だけで追加しない。 */
export function report(party: Party, owner: string, status: Omit<Member, "owner">): Party {
  return { ...party, members: party.members.map((member) => (member.owner === owner ? { owner, ...status } : member)) }
}
