import { slotAt } from "#/world/town/slot-at"

const asleep = (name: string, min: number) => {
  const s = slotAt(name, ((min % 1440) + 1440) % 1440)
  return s?.where === "home" && s.doing.includes("眠")
}

/** The minute someone gets up after their longest sleep of the day. */
export function wakeOf(name: string): number {
  let best = -1,
    wake = 0
  for (let m = 0; m < 1440; m += 15) {
    if (!asleep(name, m) || asleep(name, m - 15)) continue
    let len = 0
    while (len < 1440 && asleep(name, m + len)) len += 15
    if (len > best) [best, wake] = [len, (m + len) % 1440]
  }
  return wake
}
