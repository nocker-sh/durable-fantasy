import { expect, it } from "vitest"
import { HUNTING_STAGES } from "#/world/test/hunting-stages"
import { HuntSimulation } from "#/world/test/hunt-simulation"
import { newPlayer } from "#/world/core/new-player"
import { derive } from "#/world/core/derive"
import { apply } from "#/world/core/apply"
import { bagWith } from "#/world/test/bag-with"
import { STARTING_POINTS, START_STAT } from "#/world/core/growth-rules"
import { pointsForLevel } from "#/world/core/points-for-level"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { HUNTING_COMMISSIONS } from "#/world/core/hunting-commissions"
import { COMMISSIONS } from "#/world/core/commissions"
import { countItem } from "#/world/core/count-item"
import { loadPlayer } from "#/world/core/load-player"
import type { ItemId } from "#/world/core/items/catalog"
import { emptyLife } from "#/world/core/empty-life"

it.each(HUNTING_STAGES)("makes level $level $build viable with skills and first aid, using an earned stat budget", (stage) => {
  const spent = Object.values(stage.stats).reduce((sum, value) => sum + value - START_STAT, 0)
  expect(spent).toBeLessThanOrEqual(STARTING_POINTS + Array.from({ length: stage.level - 1 }, (_, index) => pointsForLevel(index + 2)).reduce((sum, value) => sum + value, 0))
  const starter = newPlayer()
  const base = {
    ...starter,
    level: stage.level,
    stats: stage.stats,
    bag: bagWith(["herb", 30]),
    equipment: { ...starter.equipment, weapon: stage.weapon, body: "chain-mail" as const, head: "iron-helm" as const, shield: "wooden-shield" as const },
  }
  const stats = derive(base)
  const full = { ...base, hp: stats.maxHp, sp: stats.maxSp }
  for (const seed of [1, 7, 42, 99, 1234]) {
    const active = new HuntSimulation({ player: full, kind: stage.kind, arts: stage.arts, heal: true, seed }).fight()
    expect(active.beaten, JSON.stringify(active)).toBe(true)
    expect(active.hp).toBeGreaterThan(0)
    expect(active.arts).toBeGreaterThan(0)
    expect(active.duration).toBeLessThan(90000)
  }
  const active = new HuntSimulation({ player: full, kind: stage.kind, arts: stage.arts, heal: true, seed: 42 }).fight()
  const normal = new HuntSimulation({ player: full, kind: stage.kind, arts: [], seed: 42 }).fight()
  expect(!normal.beaten || active.duration < normal.duration).toBe(true)
  expect(SPAWNS.filter((spawn) => spawn.kind === stage.kind).length).toBeGreaterThanOrEqual(4)
})

it.each(HUNTING_COMMISSIONS)("makes $output.item obtainable through a local craftsman with no life-skill levels", (job) => {
  expect(COMMISSIONS).toContain(job)
  const base = { ...newPlayer(), gold: 200, life: emptyLife(), bag: bagWith(...job.inputs.map((input): [ItemId, number] => [input.item, input.count])) }
  const ordered = apply(base, { type: "order", commission: job.id, roll: 0.5 }, { now: 1000 })
  if (!ordered.ok) throw Error(ordered.reason)
  expect(ordered.state.gold).toBe(base.gold - job.fee)
  expect(apply(ordered.state, { type: "collect", index: 0, expectedOrders: ordered.state.orders }, { now: 1000 + job.minutes * 60000 - 1 })).toEqual({ ok: false, reason: "NOT_DONE" })
  const saved = loadPlayer(structuredClone(ordered.state))
  const collected = apply(saved, { type: "collect", index: 0, expectedOrders: saved.orders }, { now: 1000 + job.minutes * 60000 })
  if (!collected.ok) throw Error(collected.reason)
  expect(countItem(collected.state.bag, job.output.item)).toBe(job.output.count)
  expect(collected.state.life).toEqual(emptyLife())
  expect(collected.state.bag.find((slot) => slot?.item === job.output.item)?.by).toBe(job.craftsman)
})

it("keeps real hunting rewards and a meaningful opponent at the level cap", () => {
  const kind = MONSTER_KINDS["old-moss-slime"]
  expect(kind.drops.map((drop) => drop.item)).toContain("dense-jelly")
  const state = { ...newPlayer(), level: 32 }
  const looted = apply(state, { type: "loot", monster: "deep-forest-old-moss-slime-0", exp: kind.exp, items: ["dense-jelly"] })
  if (!looted.ok) throw Error(looted.reason)
  expect(looted.state.exp).toBe(0)
  expect(countItem(looted.state.bag, "dense-jelly")).toBe(1)
})
