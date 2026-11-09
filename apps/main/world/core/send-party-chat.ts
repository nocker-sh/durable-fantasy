import type { Party } from "#/world/core/party/types"
import type { PartyChat } from "#/world/core/party-chat-types"
import { PARTY_CHAT_AGE, PARTY_CHAT_LIMIT, PARTY_CHAT_MESSAGE_LENGTH, PARTY_CHAT_RECENT_ATTEMPTS, PARTY_CHAT_RATE_WINDOW_MS } from "#/world/core/party-chat-rules"

type Props = Readonly<{ chat: PartyChat; party: Party; owner: string; text: string; now: number }>

/** Reject outsiders and empty text before recording attempts; rejected rapid sends still consume the rate window. */
export function sendPartyChat(props: Props): { chat: PartyChat; reason?: "NOT_MEMBER" | "EMPTY" | "RATE_LIMIT" } {
  const member = props.party.members.find((member) => member.owner === props.owner)
  if (!member) return { chat: props.chat, reason: "NOT_MEMBER" }
  const said = props.text.trim().slice(0, PARTY_CHAT_MESSAGE_LENGTH)
  if (!said) return { chat: props.chat, reason: "EMPTY" }

  const recent = (props.chat.attempts[props.owner] ?? []).slice(-PARTY_CHAT_RECENT_ATTEMPTS).filter((at) => props.now - at < PARTY_CHAT_RATE_WINDOW_MS)
  const next = { ...props.chat, attempts: { ...props.chat.attempts, [props.owner]: [...recent, props.now].slice(-PARTY_CHAT_RECENT_ATTEMPTS) } }
  if (recent.length >= PARTY_CHAT_RECENT_ATTEMPTS) return { chat: next, reason: "RATE_LIMIT" }

  const seq = props.chat.seq + 1
  const line = { seq, owner: props.owner, name: member.name, text: said, at: props.now }

  return { chat: { ...next, seq, lines: [...props.chat.lines.filter((line) => props.now - line.at < PARTY_CHAT_AGE), line].slice(-PARTY_CHAT_LIMIT) } }
}
