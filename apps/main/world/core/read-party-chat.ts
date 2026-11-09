import type { Party } from "#/world/core/party/types"
import type { PartyChat } from "#/world/core/party-chat-types"
import { PARTY_CHAT_AGE } from "#/world/core/party-chat-rules"

type Props = Readonly<{ chat: PartyChat; party: Party; owner: string; after: number; now: number }>

/** Membership and the current join sequence jointly bound the readable conversation. */
export function readPartyChat(props: Props) {
  if (!props.party.members.some((member) => member.owner === props.owner)) return null
  const since = Math.max(props.after, props.chat.joined[props.owner] ?? 0)

  return { seq: props.chat.seq, lines: props.chat.lines.filter((line) => line.seq > since && props.now - line.at < PARTY_CHAT_AGE) }
}
