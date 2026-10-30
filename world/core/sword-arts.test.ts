import { expect, it } from "vitest"
import { apply } from "./apply"
import { artSwing } from "#/world/core/art-swing"
import { loadPlayer } from "#/world/core/load-player"
import { derive } from "#/world/core/derive"
import { SKILLS } from "#/world/core/skills"
import { artBlocked } from "#/world/core/art-blocked"
import { artsOf } from "#/world/core/arts-of"
import { player } from "#/world/test/player"

it("unlocks a heavier sword blow with strength and preserves its cost and cooldown across a save", () => {
  const base = player()
  const p = player({ stats: { ...base.stats, str: 14 }, equipment: { ...base.equipment, weapon: "iron-sword" }, sp: 20 })
  expect(artsOf("short-sword")).not.toContain("hew")
  expect(artsOf("iron-sword")).toEqual(["lunge", "hew"])
  expect(artBlocked("hew", { ...p, stats: { ...p.stats, str: 13 } })).toBe("STAT_TOO_LOW")
  expect(artBlocked("hew", { ...p, equipment: { ...p.equipment, weapon: "short-sword" } })).toBe("NO_WEAPON")
  const command = { type: "art" as const, skill: "hew" as const }
  expect(apply({ ...p, sp: SKILLS.hew.sp - 1 }, command, { now: 1000 })).toEqual({ ok: false, reason: "SP_SHORT" })
  const paid = apply(p, command, { now: 1000 })
  if (!paid.ok) throw Error(paid.reason)
  const saved = loadPlayer(JSON.parse(JSON.stringify(paid.state)))
  expect(saved.sp).toBe(p.sp - SKILLS.hew.sp)
  expect(saved.ready.hew).toBe(1000 + SKILLS.hew.cooldown)
  expect(apply(saved, command, { now: saved.ready.hew! - 1 })).toEqual({ ok: false, reason: "COOLDOWN" })
  expect(apply(saved, command, { now: saved.ready.hew! }).ok).toBe(true)
  expect(apply(saved, { type: "hotbar", index: 2, item: "skill:hew" }).ok).toBe(true)
  const stats = derive(p)
  const target = { atk: 0, def: 4, hit: 0, flee: 0, crit: 0 }
  const light = artSwing({ art: SKILLS.lunge, stats: stats.stats, attacker: stats, target: target, random: () => 0.5 })
  const heavy = artSwing({ art: SKILLS.hew, stats: stats.stats, attacker: stats, target: target, random: () => 0.5 })
  if (light.kind === "miss" || heavy.kind === "miss") throw Error("Expected hits")
  expect(heavy.damage).toBeGreaterThan(light.damage)
  expect(SKILLS.hew.sp).toBeGreaterThan(SKILLS.lunge.sp)
  expect(SKILLS.hew.cooldown).toBeGreaterThan(SKILLS.lunge.cooldown)
  expect(artSwing({ art: SKILLS.hew, stats: stats.stats, attacker: stats, target: target, random: () => 0.999 })).toEqual({ kind: "miss" })
})
