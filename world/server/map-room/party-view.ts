import type { Party as PartyState } from "#/world/core/party/types"
import type { PartyView } from "#/world/protocol"

/** A party as members see it: no one's player id leaves the server. */
export const partyView = (p: PartyState, me: string): PartyView => ({
  mode: p.mode,
  leading: p.leader === me,
  members: p.members.map((m) => ({ name: m.name, level: m.level, hp: m.hp, maxHp: m.maxHp, map: m.map, leader: m.owner === p.leader, me: m.owner === me, away: Date.now() - m.at > 30_000 })),
})
