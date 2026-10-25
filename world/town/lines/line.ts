// What residents say when spoken to. Each line may say when it fits: the part of
// the day, what they are doing, who is standing nearby, how well they know you, what kind of day it
// is. The most fitting lines are said first. Lines are written per resident, by the district they live in (square.ts, market.ts, craft.ts, gate.ts).
import type { Phase } from "../../core/clock.ts"
import type { TownEvent } from "../events.ts"

export interface Line {
  text: string
  /** parts of the day it fits (clock.ts phase) */
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
}

export interface Situation {
  phase: Phase
  doing: string
  nearby: ReadonlySet<string>
  friend: number
  event: TownEvent | null
  firstTime: boolean
}

/** Does the line fit, and how closely (more conditions met, more fitting); -1 if it does not. */
export function fit(line: Line, s: Situation): number {
  let score = 0
  if (line.phase) {
    if (!line.phase.includes(s.phase)) return -1
    score++
  }
  if (line.doing) {
    if (!s.doing.includes(line.doing)) return -1
    score += 2
  }
  if (line.near) {
    if (!s.nearby.has(line.near)) return -1
    score += 2
  }
  if (line.friend) {
    if (s.friend < line.friend) return -1
    score++
  }
  if (line.event) {
    if (s.event !== line.event) return -1
    score += 3
  }
  if (line.first) {
    if (!s.firstTime) return -1
    score += 4
  }
  return score
}

/**
 * What to say this time: up to `pages` lines, the most fitting first, then others that fit, each
 * conversation a little different (`seed`), never the same line twice in one go.
 */
export function pick(lines: readonly Line[], s: Situation, pages = 3, seed = 0): string[] {
  const scored = lines.map((l, i) => ({ l, i, f: fit(l, s) })).filter((x) => x.f >= 0)
  const rand = (i: number) => {
    const x = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  scored.sort((a, b) => b.f - a.f || rand(a.i) - rand(b.i))
  const best = scored.filter((x) => x.f > 0).slice(0, 1)
  const rest = scored.filter((x) => !best.includes(x)).sort((a, b) => rand(a.i) - rand(b.i))
  return [...best, ...rest].slice(0, pages).map((x) => x.l.text)
}
