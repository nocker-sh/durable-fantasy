import { ERRANDS } from "#/world/core/errands"
import { ERRAND_ASK_CHANCE, DAILY_ERRAND_LIMIT } from "#/world/core/errand-rules"
import { hashErrandDay } from "#/world/core/hash-errand-day"
import type { Errand } from "#/world/core/errand-types"

const byResident = new Map<string, Errand[]>()
for (const errand of ERRANDS) {
  const requests = byResident.get(errand.from) ?? []
  requests.push(errand)
  byResident.set(errand.from, requests)
}
const cache: { day: string | null; requests: ReadonlyMap<string, Errand> } = { day: null, requests: new Map() }

/** 抽選と上限は町で共通にし、保持する結果は直近の一日分に限る。 */
export function getErrandRequests(day: string): ReadonlyMap<string, Errand> {
  if (cache.day === day) return cache.requests
  const candidates = [...byResident].map((entry) => ({ from: entry[0], errands: entry[1], rank: hashErrandDay(`${day}:${entry[0]}`) }))
  const selected = candidates
    .filter((candidate) => candidate.rank < ERRAND_ASK_CHANCE)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, DAILY_ERRAND_LIMIT)
  cache.requests = new Map(selected.map((candidate) => [candidate.from, candidate.errands[Math.floor(hashErrandDay(`${candidate.from}:${day}`) * candidate.errands.length)]]))
  cache.day = day

  return cache.requests
}
