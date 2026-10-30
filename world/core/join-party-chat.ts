import type { PartyChat } from "#/world/core/party-chat-types"

/** A new membership cannot read the previous membership's conversation. */
export function joinPartyChat(chat: PartyChat, owner: string): PartyChat {
  return { ...chat, joined: { ...chat.joined, [owner]: chat.seq } }
}
