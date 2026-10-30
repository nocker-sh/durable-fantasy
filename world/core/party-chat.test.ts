import { expect, it } from "vitest"
import { emptyParty } from "#/world/core/party/empty-party"
import { join } from "#/world/core/party/join"
import { leave } from "#/world/core/party/leave"
import { type Member } from "#/world/core/party/types"
import { emptyPartyChat } from "#/world/core/empty-party-chat"
import { joinPartyChat } from "#/world/core/join-party-chat"
import { leavePartyChat } from "#/world/core/leave-party-chat"
import { readPartyChat } from "#/world/core/read-party-chat"
import { sendPartyChat } from "#/world/core/send-party-chat"
import { PARTY_CHAT_AGE } from "#/world/core/party-chat-rules"
import { PARTY_CHAT_LIMIT } from "#/world/core/party-chat-rules"
const member = (owner: string): Member => ({ owner, name: owner, level: 1, hp: 10, maxHp: 10, map: owner, at: 0 })
const group = () => join(join(emptyParty(), member("a"))!, member("b"))!

it("protects conversation across joining, leaving, rejoining and disbanding", () => {
  let party = group()
  let chat = sendPartyChat({ chat: emptyPartyChat(), party: party, owner: "a", text: "before", now: 1000 }).chat
  expect(readPartyChat({ chat: chat, party: party, owner: "outsider", after: 0, now: 1000 })).toBeNull()
  expect(sendPartyChat({ chat: chat, party: party, owner: "outsider", text: "secret", now: 1000 }).reason).toBe("NOT_MEMBER")
  party = join(party, member("c"))!
  chat = joinPartyChat(chat, "c")
  expect(readPartyChat({ chat: chat, party: party, owner: "c", after: 0, now: 1000 })?.lines).toEqual([])
  chat = sendPartyChat({ chat: chat, party: party, owner: "a", text: "after", now: 2000 }).chat
  expect(readPartyChat({ chat: chat, party: party, owner: "c", after: 0, now: 2000 })?.lines.map((line) => line.text)).toEqual(["after"])
  party = leave(party, "c")
  chat = leavePartyChat(chat, party)
  expect(readPartyChat({ chat: chat, party: party, owner: "c", after: 0, now: 2000 })).toBeNull()
  party = join(party, member("c"))!
  chat = joinPartyChat(chat, "c")
  expect(readPartyChat({ chat: chat, party: party, owner: "c", after: 0, now: 2000 })?.lines).toEqual([])
  party = leave(leave(party, "c"), "b")
  chat = leavePartyChat(chat, party)
  expect(chat.lines).toEqual([])
  expect(chat.joined).toEqual({})
  expect(chat.attempts).toEqual({})
})

it("bounds history and per-member rate accounting while preserving cursors", () => {
  const party = group()
  let chat = emptyPartyChat()
  for (let i = 0; i < PARTY_CHAT_LIMIT + 20; i++) chat = sendPartyChat({ chat: chat, party: party, owner: "a", text: String(i), now: i * 1000 }).chat
  expect(chat.lines).toHaveLength(PARTY_CHAT_LIMIT)
  expect(readPartyChat({ chat: chat, party: party, owner: "b", after: chat.seq, now: 80000 })?.lines).toEqual([])
  expect(readPartyChat({ chat: chat, party: party, owner: "b", after: 0, now: 80000 + PARTY_CHAT_AGE })?.lines).toEqual([])
  for (let i = 0; i < 1000; i++) chat = sendPartyChat({ chat: chat, party: party, owner: "b", text: "burst", now: 80000 }).chat
  expect(chat.attempts.b).toHaveLength(2)
  expect(chat.lines.filter((line) => line.owner === "b")).toHaveLength(2)
  expect(sendPartyChat({ chat: chat, party: party, owner: "b", text: "burst", now: 80001 }).reason).toBe("RATE_LIMIT")
  expect(sendPartyChat({ chat: chat, party: party, owner: "b", text: "next", now: 81000 }).reason).toBeUndefined()
})
