import { afterEach, expect, it, vi } from "vitest"
import { combatAudience } from "#/world/server/map-room/combat-audience"
import { notifyCombat } from "#/world/server/map-room/notify-combat"
import { player } from "#/world/test/player"
import type { CombatNotice } from "#/world/server/wild-coordinator"

const defense = { atk: 1, def: 2, hit: 3, flee: 4, crit: 5 }
afterEach(() => vi.restoreAllMocks())

it("includes each eligible party owner once and excludes closed, fallen, unrelated and own connections", () => {
  const connections = [
    { state: { owner: "friend", party: "group" } },
    { state: { owner: "friend", party: "group" } },
    { state: { owner: "owner", party: "group" } },
    { state: { owner: "closed", party: "group", closed: true } },
    { state: { owner: "fallen", party: "group", down: true } },
    { state: { owner: "other", party: "elsewhere" } },
    { state: { owner: null, party: "group" } },
  ]
  const context = { me: { owner: "owner", party: "group" }, ctx: { room: { getConnections: () => connections } } }
  expect(combatAudience({ context, data: { party: "group", level: 3 }, life: 7, defense })).toEqual({ party: "group", near: ["friend"], level: 3, life: 7, defense })
})

it("does not inspect peers when saved membership differs from the connection", () => {
  const getConnections = vi.fn(() => [])
  const context = { me: { owner: "owner", party: "old" }, ctx: { room: { getConnections } } }
  expect(combatAudience({ context, data: { party: "new", level: 3 }, life: 7, defense })).toEqual({ party: null, near: [], level: 3, life: 7, defense })
  expect(getConnections).not.toHaveBeenCalled()
})

it("continues after a closed own socket and delivers to only the first open connection for each recipient", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const ownSend = vi.fn(async () => {
    throw Error("Socket closed")
  })
  const closedSend = vi.fn(async () => {})
  const friendSend = vi.fn(async () => {})
  const duplicateSend = vi.fn(async () => {})
  const connections = [
    { state: { owner: "friend", closed: true }, send: closedSend },
    { state: { owner: "friend" }, send: friendSend },
    { state: { owner: "friend" }, send: duplicateSend },
  ]
  const context = { me: { owner: "owner" }, ctx: { connection: { send: ownSend }, room: { getConnections: () => connections } } }
  const notices: readonly CombatNotice[] = Object.freeze([
    { owner: "owner", result: { ok: true, state: player(), events: [] } },
    { owner: "friend", result: { ok: false, reason: "FALLEN" } },
    { owner: "absent", result: { ok: false, reason: "FALLEN" } },
  ])
  await notifyCombat(context, notices)
  expect(ownSend).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: -1, result: notices[0].result })
  expect(friendSend).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: -1, result: notices[1].result })
  expect(closedSend).not.toHaveBeenCalled()
  expect(duplicateSend).not.toHaveBeenCalled()
  expect(warn).toHaveBeenCalledOnce()
  expect(notices).toHaveLength(3)
})
