import { expect, it } from "vitest"
import { GameSession } from "#/world/client/game-session"
import { ServerMessages } from "#/world/client/server-messages"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { runPlayerCommand } from "#/world/server/run-player-command"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { tell } from "#/world/parts/tell"
import type { PlayerState } from "#/world/core/player-types"
import type { ServerMessage } from "#/world/protocol"
import type { Notice } from "#/world/state"

type Context = ConstructorParameters<typeof ServerMessages>[0]

function fixture() {
  const record = initialPlayerRecord()
  const session = new GameSession()
  session.state.set((state) => ({ ...state, player: record.player }))
  const notices: { text: string; tone: Notice["tone"] }[] = []
  const messages = new ServerMessages({
    session,
    getScene: () => null,
    wayBeside: () => null,
    maybeReady: () => {},
    setPlayer: (value: PlayerState) => session.state.set((state) => ({ ...state, player: value })),
    report: (event: Parameters<typeof tell>[0]) => notices.push(...tell(event, session.state.get().player?.name).notices),
  } as unknown as Context)
  return { record, session, notices, messages }
}

for (const [kind, monster] of Object.entries(MONSTER_KINDS))
  it(`${kind}: retransmitted death and revival results notify once across room welcomes`, () => {
    const f = fixture()
    // A lethal hit is a local combat condition. Damage, death, revival and publication numbers are real.
    const fallen = runPlayerCommand(f.record, { command: { type: "hurt", amount: f.record.player.hp + 1, by: monster.name }, context: {} }, 1000)
    if (!fallen.ok) throw new Error(fallen.reason)
    expect(fallen.state.hp).toBe(0)
    expect(fallen.events.some((event) => event.type === "fell")).toBe(true)
    // A snapshot/empty publication may precede the first event for that same revision.
    f.messages.handle({ type: "snapshot", you: "first-room", me: fallen.state, players: [] })
    f.messages.handle({ type: "result", seq: -1, result: { ...fallen, events: [] } })
    expect(f.notices).toEqual([])
    const wire = JSON.parse(JSON.stringify({ type: "result", seq: -1, result: fallen })) as ServerMessage
    f.messages.handle(wire)
    expect(f.notices).toHaveLength(1)
    expect(f.notices[0].text).toBe(`${monster.name}にやられて、倒れた。`)
    f.messages.handle(wire)
    f.messages.handle({ type: "snapshot", you: "next-room", me: fallen.state, players: [] })
    f.messages.handle(wire)
    expect(f.notices).toHaveLength(1)
    expect(f.session.state.get().player).toEqual(fallen.state)
    const revived = runPlayerCommand(f.record, { command: { type: "revive" }, context: {} }, 1000)
    if (!revived.ok) throw new Error(revived.reason)
    expect(revived.state.hp).toBeGreaterThan(0)
    expect(revived.state.revision).toBeGreaterThan(fallen.state.revision)
    f.messages.handle({ type: "result", seq: -1, result: revived })
    f.messages.handle({ type: "result", seq: -1, result: revived })
    f.messages.handle(wire)
    expect(f.notices).toHaveLength(2)
    expect(f.session.state.get().player).toEqual(revived.state)
  })

it("keeps unnumbered legacy results observable instead of treating all of them as duplicates", () => {
  const f = fixture()
  const fallen = runPlayerCommand(f.record, { command: { type: "hurt", amount: f.record.player.hp + 1, by: Object.values(MONSTER_KINDS)[0].name }, context: {} }, 1000)
  if (!fallen.ok) throw new Error(fallen.reason)
  const { revision: _revision, ...legacy } = fallen.state
  const result = { ...fallen, state: legacy as PlayerState }
  f.messages.handle({ type: "result", seq: -1, result })
  f.messages.handle({ type: "result", seq: -1, result })
  expect(f.notices).toHaveLength(2)
})
