import type { Party } from "#/world/core/party/types"
import type { PartyChat } from "#/world/core/party-chat-types"

/** Remove departed members' join and rate records, clearing history only when the party becomes empty. */
export function leavePartyChat(chat: PartyChat, party: Party): PartyChat {
  const members = new Set(party.members.map((member) => member.owner))

  return {
    ...chat,
    lines: members.size ? chat.lines : [],
    joined: Object.fromEntries(Object.entries(chat.joined).filter((entry) => members.has(entry[0]))),
    attempts: Object.fromEntries(Object.entries(chat.attempts).filter((entry) => members.has(entry[0]))),
  }
}
