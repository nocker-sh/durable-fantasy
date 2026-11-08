import { readSpokenNames } from "#/world/parts/read-spoken-names"
import { phase } from "#/world/core/phase"
import { errandProgress } from "#/world/core/errand-progress"
import { eventOf } from "#/world/town/event-of"
import { pick } from "#/world/town/lines/pick"
import type { Situation } from "#/world/town/lines/line"
import { ALL_LINES } from "#/world/town/lines/index"
import { slotAt } from "#/world/town/slot-at"
import type { GameState } from "#/world/state"

type Props = {
  state: GameState
  name: string
  spokenKey: string
  now?: number
}

/**
 * What a resident says this time (town/lines.ts): the lines that fit the hour, what they are
 * doing, who is nearby, what kind of day it is and whether we have spoken before (remembered
 * under `spokenKey`).
 */
export function linesFor(props: Props): string[] {
  const now = props.now === undefined ? Date.now() : props.now

  const spoken = readSpokenNames(props.spokenKey)
  const situation: Situation = {
    phase: phase(props.state.clock.min),
    doing: slotAt(props.name, props.state.clock.min)?.doing ?? "",
    nearby: new Set(props.state.npcs.map((n) => n.name).filter((n) => n !== props.name)),
    friend: props.state.player?.friends[props.name] ?? 0,
    event: eventOf(now),
    errands: props.state.player ? errandProgress(props.state.player, props.name, now) : {},
    firstTime: !spoken.includes(props.name),
  }
  if (situation.firstTime) localStorage.setItem(props.spokenKey, JSON.stringify([...spoken, props.name]))
  const pages = pick({ lines: ALL_LINES[props.name] ?? [], s: situation, pages: 3, seed: Math.floor(now / 60_000) })
  return pages.length ? pages : ["……"]
}
