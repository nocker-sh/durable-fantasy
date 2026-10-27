import type { Party } from "./party.ts"

export const PARTY_CHAT_LIMIT = 60
export const PARTY_CHAT_AGE = 5 * 60_000
export interface PartyChatLine {
  seq: number
  owner: string
  name: string
  text: string
  at: number
}
export interface PartyChat {
  seq: number
  lines: PartyChatLine[]
  joined: Record<string, number>
  attempts: Record<string, number[]>
}
export const emptyPartyChat = (): PartyChat => ({ seq: 0, lines: [], joined: {}, attempts: {} })

export function sendPartyChat(chat: PartyChat, party: Party, owner: string, text: string, now: number): { chat: PartyChat; reason?: "NOT_MEMBER" | "EMPTY" | "RATE_LIMIT" } {
  const member = party.members.find((member) => member.owner === owner)
  if (!member) return { chat, reason: "NOT_MEMBER" }
  const said = text.trim().slice(0, 140)
  if (!said) return { chat, reason: "EMPTY" }
  const recent = (chat.attempts[owner] ?? []).slice(-2).filter((at) => now - at < 1000)
  const next = { ...chat, attempts: { ...chat.attempts, [owner]: [...recent, now].slice(-2) } }
  if (recent.length >= 2) return { chat: next, reason: "RATE_LIMIT" }
  const seq = chat.seq + 1
  const line = { seq, owner, name: member.name, text: said, at: now }
  return { chat: { ...next, seq, lines: [...chat.lines.filter((line) => now - line.at < PARTY_CHAT_AGE), line].slice(-PARTY_CHAT_LIMIT) } }
}

export function readPartyChat(chat: PartyChat, party: Party, owner: string, after: number, now: number) {
  if (!party.members.some((member) => member.owner === owner)) return null
  const since = Math.max(after, chat.joined[owner] ?? 0)
  return { seq: chat.seq, lines: chat.lines.filter((line) => line.seq > since && now - line.at < PARTY_CHAT_AGE) }
}

/** A new membership cannot read the previous membership's conversation. */
export function joinPartyChat(chat: PartyChat, owner: string): PartyChat {
  return { ...chat, joined: { ...chat.joined, [owner]: chat.seq } }
}

export function leavePartyChat(chat: PartyChat, party: Party): PartyChat {
  const members = new Set(party.members.map((member) => member.owner))
  return {
    ...chat,
    lines: members.size ? chat.lines : [],
    joined: Object.fromEntries(Object.entries(chat.joined).filter(([owner]) => members.has(owner))),
    attempts: Object.fromEntries(Object.entries(chat.attempts).filter(([owner]) => members.has(owner))),
  }
}
