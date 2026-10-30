// Snapshot the recipients and rolls before payment. Recovery uses the saved plan, never a new roll.
import { swing } from "#/world/core/swing"
import type { Fighter } from "#/world/core/combat-types"
import type { Random } from "#/world/core/combat-types"
import type { Swing } from "#/world/core/combat-types"
import type { CombatEffect } from "#/world/core/combat-delivery-types"
import { dropsOf } from "#/world/core/drops-of"
import { type MonsterKind } from "#/world/core/monster-types"
import { shareOut } from "#/world/core/party/share-out"
import { type Party } from "#/world/core/party/types"
import type { PlayerState } from "#/world/core/player-types"
import { readCombatAudience } from "#/world/server/read-combat-audience"

export type CombatAudience = {
  party: string | null
  near: string[]
  level: number
  life: number
  defense: Fighter
}
export type CombatPlan = {
  life?: number
  effects: CombatEffect[]
  counter?: Swing
}
export type CombatReader = { read(): Promise<PlayerState>; readCombat(): Promise<{ player: PlayerState; life: number }> }
export async function planCombat(inputProps: {
  players: (owner: string) => CombatReader
  parties: (party: string) => { view(): Promise<Party> }
  owner: string
  monster: string
  kind: MonsterKind
  beaten: boolean
  audience: CombatAudience | undefined
  random: Random
}): Promise<CombatPlan> {
  const players = inputProps.players
  const parties = inputProps.parties
  const owner = inputProps.owner
  const monster = inputProps.monster
  const kind = inputProps.kind
  const beaten = inputProps.beaten
  const audience = inputProps.audience || (await readCombatAudience(players, owner))
  const random = inputProps.random

  if (!beaten) {
    if (kind.atk <= 0) return { life: audience.life, effects: [] }
    const counter = swing({ atk: kind.atk, def: kind.def, hit: kind.hit, flee: kind.flee, crit: 0 }, audience.defense, random)
    return { life: audience.life, counter, effects: counter.kind === "miss" ? [] : [{ owner, life: audience.life, command: { type: "hurt", amount: counter.damage, by: kind.name } }] }
  }
  const items = dropsOf(kind, kind.drops.map(random))
  const near: { owner: string; level: number }[] = []
  if (audience.party) {
    const killer = await players(owner).read()
    const party = killer.party === audience.party ? await parties(audience.party).view() : null
    if (party?.mode === "even" && party.members.some((member) => member.owner === owner)) {
      const members = new Set(party.members.map((member) => member.owner))
      for (const candidate of new Set(audience.near)) {
        if (candidate === owner || !members.has(candidate)) continue
        const p = await players(candidate).read()
        if (p.hp > 0 && p.party === audience.party) near.push({ owner: candidate, level: p.level })
      }
    }
  }
  const shares = shareOut({ exp: kind.exp, mode: "even", killer: { owner, level: audience.level }, near: near })
  return {
    life: audience.life,
    effects: shares.map((share) => ({ owner: share.owner, command: share.owner === owner ? { type: "loot", monster, exp: share.exp, items } : { type: "share", monster, exp: share.exp } })),
  }
}
