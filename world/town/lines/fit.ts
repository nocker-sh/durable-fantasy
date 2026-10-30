import type { Line, Situation } from "#/world/town/lines/line"

/** Failed conditions exclude a line before its specificity is scored. */
export function fit(line: Line, situation: Situation): number {
  if (line.phase && !line.phase.includes(situation.phase)) return -1
  if (line.doing && !situation.doing.includes(line.doing)) return -1
  if (line.near && !situation.nearby.has(line.near)) return -1
  if (line.friend && situation.friend < line.friend) return -1
  if (line.event && situation.event !== line.event) return -1
  if (line.first && !situation.firstTime) return -1
  if (line.errand && situation.errands?.[line.errand.id] !== line.errand.state) return -1

  return (
    Number(Boolean(line.phase)) +
    Number(Boolean(line.doing)) * 2 +
    Number(Boolean(line.near)) * 2 +
    Number(Boolean(line.friend)) +
    Number(Boolean(line.event)) * 3 +
    Number(Boolean(line.first)) * 4 +
    Number(Boolean(line.errand)) * 5
  )
}
