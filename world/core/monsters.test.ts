import { describe, expect, it } from "vitest"
import { apply } from "./apply.ts"
import { CLAIM_MS, MONSTER_KINDS, SPAWNS, dropsOf, monsterAt, spawnOf, spawnsOn } from "./monsters.ts"
import { emptyWild, fighting, hit, hpOf } from "./wild.ts"
import { MAPS, walkable } from "../maps/index.ts"
import { player } from "../test/helpers.ts"
import { settle } from "./player.ts"
import { derive } from "./stats.ts"
import { expToNext } from "./growth.ts"

const slime = SPAWNS.find((s) => s.kind === "slime")!

describe("the creatures outside town", () => {
  it("preserves every map's population and definition order through indexed lookups", () => {
    for (const map of Object.keys(MAPS)) {
      const expected = SPAWNS.filter((spawn) => spawn.map === map)
      expect(spawnsOn(map)).toEqual(expected)
      expect(spawnsOn(map)).toBe(spawnsOn(map))
      for (const spawn of expected) expect(spawnOf(spawn.id)).toBe(spawn)
    }
    expect(spawnsOn("unknown-map")).toEqual([])
    expect(spawnOf("unknown-creature")).toBeUndefined()
    expect(spawnOf("constructor")).toBeUndefined()
  })

  it("wander within their area, on free ground, the same for everyone at the same moment", () => {
    const map = MAPS[slime.map]
    const free = (x: number, z: number) => walkable(map, [Math.floor(x * 2), Math.floor(z * 2)])
    for (let t = 0; t < 120_000; t += 4_500) {
      const a = monsterAt(slime, t, free),
        b = monsterAt(slime, t, free)
      expect(a).toEqual(b)
      expect(a.x).toBeGreaterThanOrEqual(slime.area[0] - 0.01)
      expect(a.x).toBeLessThanOrEqual(slime.area[2] + 0.01)
    }
  })

  it("places forest creatures in clear territories and keeps their movement off blocked cells", () => {
    expect(new Set(SPAWNS.map((s) => s.id)).size).toBe(SPAWNS.length)
    const forest = SPAWNS.filter((s) => s.map === "forest-edge" || s.map === "deep-forest")
    expect(new Set(forest.map((s) => s.map)).size).toBe(2)
    for (const spawn of forest) {
      const free = (x: number, z: number) => walkable(MAPS[spawn.map], [Math.floor(x * 2), Math.floor(z * 2)])
      for (let z = spawn.area[1]; z <= spawn.area[3]; z += 0.5) for (let x = spawn.area[0]; x <= spawn.area[2]; x += 0.5) expect(free(x, z), spawn.id).toBe(true)
      for (let time = 0; time < 86_400_000; time += 7311) {
        const at = monsterAt(spawn, time, free)
        expect(free(at.x, at.z), spawn.id).toBe(true)
      }
    }
  })

  it("lets forest creatures share the existing claim, recovery and reward rules", () => {
    const spawn = SPAWNS.find((s) => s.kind === "moss-slime")!
    const kind = MONSTER_KINDS[spawn.kind]
    const struck = hit(emptyWild(), spawn.id, 1, 0, "hunter")
    expect(hit(struck.state, spawn.id, kind.hp, 1, "other").refused).toBe(true)
    const beaten = hit(struck.state, spawn.id, kind.hp, 2, "hunter")
    expect(beaten.beaten).toBe(true)
    expect(hpOf(beaten.state, spawn.id, 3)).toBe(0)
    expect(hpOf(beaten.state, spawn.id, 2 + kind.respawn * 1000)).toBe(kind.hp)
    const reward = apply(player({ level: 16 }), { type: "loot", monster: spawn.id, exp: kind.exp, items: dropsOf(kind, [0, 0, 0]) })
    expect(reward.ok && reward.state.exp).toBe(kind.exp)
    expect(dropsOf(kind, [0, 0, 0])).toEqual(["jelly", "blue-jelly", "herb"])
  })

  it("take blows until beaten, then are off for a while and come back whole", () => {
    let s = emptyWild()
    const max = MONSTER_KINDS.slime.hp
    let r = hit(s, slime.id, 10, 0, "a")
    expect(r.hp).toBe(max - 10)
    r = hit(r.state, slime.id, 999, 1, "a")
    expect(r.beaten).toBe(true)
    s = r.state
    expect(hpOf(s, slime.id, 2)).toBe(0)
    expect(hit(s, slime.id, 5, 3, "a").beaten).toBe(false) // already away
    expect(hpOf(s, slime.id, MONSTER_KINDS.slime.respawn * 1000 + 2)).toBe(max)
  })

  it("are the first striker's to finish; others' blows glance off until the fight lapses, and left alone they recover", () => {
    const r = hit(emptyWild(), slime.id, 10, 0, "a")
    const other = hit(r.state, slime.id, 10, 1000, "b")
    expect(other.refused).toBe(true)
    expect(other.hp).toBe(MONSTER_KINDS.slime.hp - 10)
    expect(fighting(r.state, slime.id, 1000)).toBe("a")
    // a's last blow was at 0: after CLAIM_MS it is anyone's, and whole again
    expect(hpOf(r.state, slime.id, CLAIM_MS)).toBe(MONSTER_KINDS.slime.hp)
    const later = hit(r.state, slime.id, 10, CLAIM_MS, "b")
    expect(later.refused).toBe(false)
    expect(later.hp).toBe(MONSTER_KINDS.slime.hp - 10)
  })

  it("leave what they drop by chance, and the spoils come with experience and a little tiredness", () => {
    expect(dropsOf(MONSTER_KINDS.slime, [0.1, 0.9])).toEqual(["jelly"])
    expect(dropsOf(MONSTER_KINDS.slime, [0.95, 0.05])).toEqual(["herb"])
    const p = player({ stamina: 30 })
    const r = apply(p, { type: "loot", monster: slime.id, exp: 9, items: ["jelly"] })
    expect(r.ok && r.state.exp).toBe(p.exp + 9)
    expect(r.ok && r.state.stamina).toBe(28)
    expect(r.ok && r.state.bag.some((s) => s?.item === "jelly")).toBe(true)
  })

  it("live only where world.md puts them: the fields and forests beyond the gate, not in town", () => {
    for (const s of SPAWNS) expect(MAPS[s.map].kind, s.id).toBe("field")
  })

  it("a blow taken lowers HP; at 0 they fall, can do nothing, and come to in town with half", () => {
    const p = player({ hp: 10, hpAt: 0, gold: 50 })
    const hurt = apply(p, { type: "hurt", amount: 4, by: "スライム" }, { now: 1 })
    expect(hurt.ok && hurt.state.hp).toBe(6)
    const fell = hurt.ok ? apply(hurt.state, { type: "hurt", amount: 9, by: "スライム" }, { now: 2 }) : hurt
    expect(fell.ok && fell.events[0]).toEqual({ type: "fell", by: "スライム" })
    if (!fell.ok) return
    // fallen, HP does not come back and nothing else can be done
    expect(apply(fell.state, { type: "use-item", item: "rye-bread" }, { now: 600_000 })).toEqual({ ok: false, reason: "FALLEN" })
    const up = apply(fell.state, { type: "revive" }, { now: 600_000 })
    expect(up.ok && up.state.hp).toBe(Math.floor(derive(p).maxHp / 2))
    // new to the road, no experience is lost
    expect(up.ok && up.state.exp).toBe(p.exp)
    expect(up.ok && apply(up.state, { type: "revive" }, { now: 600_001 })).toEqual({ ok: false, reason: "NOT_FALLEN" })
  })

  it("past level 5, falling costs 1% of what the next level needs", () => {
    const p = player({ hp: 1, level: 10, exp: 500 })
    const fell = apply(p, { type: "hurt", amount: 5, by: "スライム" }, { now: 1 })
    const up = fell.ok ? apply(fell.state, { type: "revive" }, { now: 2 }) : fell
    expect(up.ok && up.state.exp).toBe(500 - Math.floor(expToNext(10) / 100))
  })

  it("HP and SP come back every twenty seconds while up, more with VIT and MND, twice sitting, up to the most", () => {
    const r = { maxHp: 48, maxSp: 16, regenHp: 1, regenSp: 1 }
    const t = 1_000_000
    const p = { hp: 10, hpAt: t, sp: 4, spAt: t, sitting: false }
    expect(settle(p, r, t + 59_999)).toMatchObject({ hp: 12, sp: 6 })
    expect(settle(p, r, t + 60_000)).toMatchObject({ hp: 13, hpAt: t + 60_000 })
    expect(settle({ ...p, sitting: true }, r, t + 60_000)).toMatchObject({ hp: 16, sp: 10 })
    expect(settle(p, { ...r, regenHp: 3 }, t + 60_000).hp).toBe(19)
    expect(settle(p, r, t + 20 * 60_000)).toMatchObject({ hp: 48, sp: 16 })
    expect(settle({ ...p, hp: 0 }, r, t + 10 * 60_000).hp).toBe(0)
    // a new traveller starts counting from the first time it is looked at, not from long ago
    expect(settle({ ...p, hpAt: 0 }, r, t)).toMatchObject({ hp: 10, hpAt: t })
  })
})
