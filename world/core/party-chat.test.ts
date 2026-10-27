import { expect, it } from "vitest"
import { emptyParty, join, leave, type Member } from "./party.ts"
import { emptyPartyChat, joinPartyChat, leavePartyChat, readPartyChat, sendPartyChat, PARTY_CHAT_AGE, PARTY_CHAT_LIMIT } from "./party-chat.ts"
const member = (owner: string): Member => ({ owner, name: owner, level: 1, hp: 10, maxHp: 10, map: owner, at: 0 })
const group = () => join(join(emptyParty(), member("a"))!, member("b"))!

it("protects conversation across joining, leaving, rejoining and disbanding", () => {
  let party = group()
  let chat = sendPartyChat(emptyPartyChat(), party, "a", "before", 1000).chat
  expect(readPartyChat(chat, party, "outsider", 0, 1000)).toBeNull()
  expect(sendPartyChat(chat, party, "outsider", "secret", 1000).reason).toBe("NOT_MEMBER")
  party = join(party, member("c"))!
  chat = joinPartyChat(chat, "c")
  expect(readPartyChat(chat, party, "c", 0, 1000)?.lines).toEqual([])
  chat = sendPartyChat(chat, party, "a", "after", 2000).chat
  expect(readPartyChat(chat, party, "c", 0, 2000)?.lines.map((line) => line.text)).toEqual(["after"])
  party = leave(party, "c")
  chat = leavePartyChat(chat, party)
  expect(readPartyChat(chat, party, "c", 0, 2000)).toBeNull()
  party = join(party, member("c"))!
  chat = joinPartyChat(chat, "c")
  expect(readPartyChat(chat, party, "c", 0, 2000)?.lines).toEqual([])
  party = leave(leave(party, "c"), "b")
  chat = leavePartyChat(chat, party)
  expect(chat.lines).toEqual([])
  expect(chat.joined).toEqual({})
  expect(chat.attempts).toEqual({})
})

it("bounds history and per-member rate accounting while preserving cursors", () => {
  const party = group()
  let chat = emptyPartyChat()
  for (let i = 0; i < PARTY_CHAT_LIMIT + 20; i++) chat = sendPartyChat(chat, party, "a", String(i), i * 1000).chat
  expect(chat.lines).toHaveLength(PARTY_CHAT_LIMIT)
  expect(readPartyChat(chat, party, "b", chat.seq, 80000)?.lines).toEqual([])
  expect(readPartyChat(chat, party, "b", 0, 80000 + PARTY_CHAT_AGE)?.lines).toEqual([])
  for (let i = 0; i < 1000; i++) chat = sendPartyChat(chat, party, "b", "burst", 80000).chat
  expect(chat.attempts.b).toHaveLength(2)
  expect(chat.lines.filter((line) => line.owner === "b")).toHaveLength(2)
  expect(sendPartyChat(chat, party, "b", "burst", 80001).reason).toBe("RATE_LIMIT")
  expect(sendPartyChat(chat, party, "b", "next", 81000).reason).toBeUndefined()
})
