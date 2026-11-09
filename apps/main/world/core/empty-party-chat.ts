import type { PartyChat } from "#/world/core/party-chat-types"

export function emptyPartyChat(): PartyChat {
  return { seq: 0, lines: [], joined: {}, attempts: {} }
}
