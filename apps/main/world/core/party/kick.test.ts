import { expect, it } from "vitest"
import { kick } from "#/world/core/party/kick"
import { promote } from "#/world/core/party/promote"
import type { Member, Party } from "#/world/core/party/types"

const member = (owner: string): Member => ({ owner, name: owner, level: 1, hp: 1, maxHp: 1, map: "広場", at: 0 })
const party: Party = { leader: "a", mode: "even", members: [member("a"), member("b"), member("c")] }

it("lets only the leader remove another member", () => {
  expect(kick({ party, leader: "a", target: "b" })?.members.map((m) => m.owner)).toEqual(["a", "c"])
  expect(kick({ party, leader: "b", target: "c" })).toBeNull()
  expect(kick({ party, leader: "a", target: "a" })).toBeNull()
  expect(kick({ party, leader: "a", target: "z" })).toBeNull()
  expect(kick({ party: { ...party, members: party.members.slice(0, 2) }, leader: "a", target: "b" })?.members).toEqual([])
})

it("lets only the leader hand the lead to a member", () => {
  expect(promote({ party, leader: "a", target: "c" })).toEqual({ ...party, leader: "c" })
  expect(promote({ party, leader: "b", target: "c" })).toBeNull()
  expect(promote({ party, leader: "a", target: "z" })).toBeNull()
})
