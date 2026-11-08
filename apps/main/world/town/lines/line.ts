import type { ErrandProgress } from "#/world/core/errand-types"
import type { Phase } from "#/world/core/clock-types"
import type { TownEvent } from "#/world/town/events"

export type Line = {
  text: string
  /** parts of the day it fits (phase.ts) */
  phase?: readonly Phase[]
  /** words in what they are doing now (routines.ts `doing`), e.g. "夜市", "一杯", "洗う" */
  doing?: string
  /** someone who has to be standing on the same map */
  near?: string
  /** how well they have to know you (0–100) */
  friend?: number
  /** only on a day like this */
  event?: TownEvent
  /** only the first time you speak to them */
  first?: true
  errand?: { id: string; state: ErrandProgress }
}

export type Situation = {
  phase: Phase
  doing: string
  nearby: ReadonlySet<string>
  friend: number
  event: TownEvent | null
  firstTime: boolean
  errands?: Readonly<Record<string, ErrandProgress>>
}
