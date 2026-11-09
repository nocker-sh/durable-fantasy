import { addItem } from "#/world/core/add-item"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createGameState } from "#/world/client/initial-state"
import { apply } from "#/world/core/apply"
import { countItem } from "#/world/core/count-item"
import { dayOf } from "#/world/core/day-of"
import { errandProgress } from "#/world/core/errand-progress"
import type { Errand, ErrandProgress } from "#/world/core/errand-types"
import { ERRANDS } from "#/world/core/errands"
import { FRIEND } from "#/world/core/friendship-rules"
import { jstMinutes } from "#/world/core/jst-minutes"
import { loadPlayer } from "#/world/core/load-player"
import type { PlayerState } from "#/world/core/player-types"
import { npcsAt } from "#/world/maps/npcs-at"
import { choicesFor } from "#/world/parts/choices-for"
import { linesFor } from "#/world/parts/lines-for"
import type { GameState } from "#/world/state"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"
import { ALL_LINES } from "#/world/town/lines/index"
import { RESIDENTS } from "#/world/town/residents"

import { errandMeetings } from "#/world/test/errand-meetings"
import type { ErrandMeeting as Meeting } from "#/world/test/errand-meetings"
const DAY = 86_400_000

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function viewAt(state: PlayerState, meeting: Meeting): GameState {
  vi.setSystemTime(meeting.now)
  const base = createGameState().get()
  const min = jstMinutes(meeting.now)
  return {
    ...base,
    player: state,
    map: { id: meeting.map.id, name: meeting.map.name, warps: meeting.map.warps.map((warp) => warp.at) },
    clock: { min, held: false },
    npcs: npcsAt(meeting.map, min).map((npc) => ({
      id: RESIDENTS.findIndex((resident) => resident.name === npc.name),
      name: npc.name,
      job: RESIDENTS.find((resident) => resident.name === npc.name)!.job,
      x: npc.cell[0],
      z: npc.cell[1],
      role: "other",
    })),
  }
}

function checkDialogue(state: PlayerState, meeting: Meeting, expected: { errand: Errand; phase: ErrandProgress }) {
  const view = viewAt(state, meeting)
  expect(errandProgress(state, meeting.name, meeting.now)[expected.errand.id]).toBe(expected.phase)
  expect(choicesFor(view, meeting.name).some((choice) => choice.action === "errand-hand" && choice.errand === expected.errand.id)).toBe(
    expected.phase !== "done" && meeting.name === (expected.errand.kind === "bring" ? expected.errand.from : expected.errand.to),
  )
  const pages = linesFor({ state: view, name: meeting.name, spokenKey: "errand-playthrough", now: meeting.now })
  const authored = ALL_LINES[meeting.name].filter((line) => line.errand?.id === expected.errand.id)
  const matching = authored.filter((line) => line.errand!.state === expected.phase)
  if (matching.length) expect(pages.some((text) => matching.some((line) => line.text === text))).toBe(true)
  for (const line of authored) if (line.errand!.state !== expected.phase) expect(pages).not.toContain(line.text)
}

describe("every authored errand through real commands and dialogue", () => {
  it.each(ERRANDS)("$id: completes once, survives saving, and expires without a second payment", (errand) => {
    vi.useFakeTimers()
    const spoken = new Map<string, string>()
    vi.stubGlobal("localStorage", { getItem: (key: string) => spoken.get(key) ?? null, setItem: (key: string, value: string) => spoken.set(key, value) })
    const plan = errandMeetings(errand)
    // Required materials and one surplus item are explicit starting assets; no progress or friendship is injected.
    // a lost thing is held only while it is sought, so no spare of it is carried
    const initial = player(errand.kind === "bring" ? { bag: bagWith([errand.wants.item, errand.wants.count + (errand.find ? 0 : 1)]) } : {})
    expect(initial.errands).toEqual([])
    expect(initial.friends).toEqual({})
    const offered = choicesFor(viewAt(initial, plan.ask), errand.from)
    expect(offered).toContainEqual(expect.objectContaining({ action: "errand-ask", errand: errand.id }))
    const take = { type: "errand-take", errand: errand.id, from: errand.from } as const
    const hand = { type: "errand-hand", errand: errand.id, to: plan.hand.name } as const
    expect(apply(initial, hand, { now: plan.ask.now })).toEqual({ ok: false, reason: "NO_ERRAND" })

    if (errand.kind === "bring") {
      const short = player({ bag: errand.wants.count > 1 ? bagWith([errand.wants.item, errand.wants.count - 1]) : bagWith() })
      const shortTaken = apply(short, take, { now: plan.ask.now })
      if (!shortTaken.ok) throw new Error(`${errand.id}: ${shortTaken.reason}`)
      checkDialogue(shortTaken.state, plan.hand, { errand, phase: "taken" })
      const unchanged = structuredClone(shortTaken.state)
      expect(apply(shortTaken.state, hand, { now: plan.hand.now })).toEqual({ ok: false, reason: "NOT_ENOUGH" })
      expect(shortTaken.state).toEqual(unchanged)
    }

    const taken = apply(initial, take, { now: plan.ask.now })
    if (!taken.ok) throw new Error(`${errand.id}: ${taken.reason}`)
    expect(taken.events).toEqual([{ type: "errand-taken", errand: errand.id }])
    expect(taken.state.errands).toEqual([{ id: errand.id, day: dayOf(plan.ask.now), done: false }])
    // a letter to deliver comes into the bag with the errand
    expect(taken.state.bag).toEqual(errand.kind === "deliver" && errand.carry ? addItem({ bag: initial.bag, item: errand.carry, count: 1 }) : initial.bag)
    expect(taken.state.gold).toBe(initial.gold)
    expect(taken.state.friends).toEqual({})
    expect(apply(taken.state, take, { now: plan.ask.now })).toEqual({ ok: false, reason: "NO_ERRAND" })
    expect(choicesFor(viewAt(taken.state, plan.ask), errand.from).some((choice) => choice.action === "errand-ask" && choice.errand === errand.id)).toBe(false)
    checkDialogue(taken.state, plan.ask, { errand, phase: errand.kind === "bring" ? "ready" : "taken" })
    checkDialogue(taken.state, plan.hand, { errand, phase: "ready" })

    const resumed = loadPlayer(JSON.parse(JSON.stringify(taken.state)))
    expect(resumed).toEqual(taken.state)
    checkDialogue(resumed, plan.hand, { errand, phase: "ready" })
    const wrongRecipient = RESIDENTS.find((resident) => resident.name !== errand.from && resident.name !== plan.hand.name)!.name
    const beforeHand = structuredClone(resumed)
    expect(apply(resumed, { ...hand, to: wrongRecipient }, { now: plan.hand.now })).toEqual({ ok: false, reason: "NO_ERRAND" })
    expect(resumed).toEqual(beforeHand)
    const done = apply(resumed, hand, { now: plan.hand.now })
    if (!done.ok) throw new Error(`${errand.id}: ${done.reason}`)
    const expectedFriends = errand.kind === "bring" ? { [errand.from]: FRIEND.bring } : { [errand.from]: FRIEND.deliver, [errand.to]: FRIEND.received }
    expect(done.state.gold).toBe(initial.gold + errand.gold)
    expect(done.state.friends).toEqual(expectedFriends)
    expect(done.events).toEqual([{ type: "errand-done", errand: errand.id, gold: errand.gold, friends: expectedFriends }])
    expect(done.state.errands).toEqual([{ id: errand.id, day: dayOf(plan.hand.now), done: true }])
    if (errand.kind === "bring" && !errand.find) {
      expect(countItem(done.state.bag, errand.wants.item)).toBe(1)
      expect(done.state.bag).toEqual(bagWith([errand.wants.item, 1]))
    } else if (errand.kind === "bring") expect(countItem(done.state.bag, errand.wants.item)).toBe(0)
    else expect(done.state.bag).toEqual(initial.bag)
    checkDialogue(done.state, plan.hand, { errand, phase: "done" })
    expect(errandProgress(done.state, errand.from, plan.hand.now)[errand.id]).toBe("done")

    const savedDone = loadPlayer(JSON.parse(JSON.stringify(done.state)))
    expect(savedDone).toEqual(done.state)
    const unchanged = structuredClone(savedDone)
    expect(apply(savedDone, hand, { now: plan.hand.now })).toEqual({ ok: false, reason: "NO_ERRAND" })
    expect(apply(savedDone, take, { now: plan.hand.now })).toEqual({ ok: false, reason: "NO_ERRAND" })
    expect(savedDone).toEqual(unchanged)
    const tomorrow = plan.hand.now + DAY
    expect(apply(resumed, hand, { now: tomorrow })).toEqual({ ok: false, reason: "NO_ERRAND" })
    expect(errandProgress(resumed, plan.hand.name, tomorrow)).toEqual({})
    expect(choicesFor(viewAt(resumed, { ...plan.hand, now: tomorrow }), plan.hand.name).some((choice) => choice.action === "errand-hand" && choice.errand === errand.id)).toBe(false)
    expect(resumed).toEqual(beforeHand)
  })
})
