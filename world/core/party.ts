// Parties (game-system.md §10): up to twelve travelling together. The leader asks, the other agrees.
// Experience from a creature is each one's own, or shared evenly among those of the party on the same
// map within fifteen levels of the one who beat it. Members see each other's HP and where they are.
// Pure; the party Durable Object keeps it.

export const PARTY_MAX = 12
export const SHARE_LEVELS = 15

export type ShareMode = "own" | "even"

export interface Member {
  owner: string
  name: string
  level: number
  hp: number
  maxHp: number
  /** the map's name, as last reported */
  map: string
  /** when they last reported (ms) */
  at: number
}

export interface Party {
  leader: string
  mode: ShareMode
  members: Member[]
}

export const emptyParty = (): Party => ({ leader: "", mode: "own", members: [] })

/** Add someone (the first is the leader); null when full or already in. */
export function join(p: Party, m: Member): Party | null {
  if (p.members.some((x) => x.owner === m.owner)) return p
  if (p.members.length >= PARTY_MAX) return null
  return { ...p, leader: p.leader || m.owner, members: [...p.members, m] }
}

/** Someone leaves; the next one in leads if it was the leader. A party of one is no party. */
export function leave(p: Party, owner: string): Party {
  const members = p.members.filter((m) => m.owner !== owner)
  if (members.length < 2) return emptyParty()
  return { ...p, members, leader: p.leader === owner ? members[0].owner : p.leader }
}

export function report(p: Party, owner: string, s: Omit<Member, "owner">): Party {
  return { ...p, members: p.members.map((m) => (m.owner === owner ? { owner, ...s } : m)) }
}

/**
 * How a creature's experience is shared out among those who may share it (the one who beat it
 * first). Each share is rounded down and what is left over goes to the one who beat it, so the
 * shares never come to more than the creature was worth.
 */
export function shareOut(exp: number, mode: ShareMode, killer: { owner: string; level: number }, near: readonly { owner: string; level: number }[]): { owner: string; exp: number }[] {
  if (mode === "own") return [{ owner: killer.owner, exp }]
  const with_ = [killer, ...near.filter((m) => m.owner !== killer.owner && Math.abs(m.level - killer.level) <= SHARE_LEVELS)]
  const each = Math.floor(exp / with_.length)
  const left = exp - each * with_.length
  return with_.map((m) => ({ owner: m.owner, exp: m.owner === killer.owner ? each + left : each }))
}
