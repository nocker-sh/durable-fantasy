import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { SKILLS } from "#/world/core/skills"
import { skillOf } from "#/world/core/skill-of"
import type { SkillId } from "#/world/core/skill-types"
import { derive } from "#/world/core/derive"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { firstAid } from "#/world/core/first-aid"
import { markFor } from "#/world/core/mark-for"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"
import type { PlayerState } from "#/world/core/player-types"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

for (const skill of (Object.keys(SKILLS) as SkillId[]).filter((id) => id === "first-aid" || skillOf(id).kind === "prayer")) {
  const definition = skillOf(skill)
  const weapons = definition.kind === "prayer" ? definition.weapons : [null]
  for (const weapon of weapons)
    for (const alchemy of skill === "first-aid" ? [0, 8] : [0])
      for (const nearlyFull of [false, true])
        for (const restartBeforeRetry of [false, true])
          it(`${skill}, weapon=${weapon}, alchemy=${alchemy}, nearlyFull=${nearlyFull}, restartBeforeRetry=${restartBeforeRetry}: healing and payment resume together`, async () => {
            vi.useFakeTimers()
            vi.setSystemTime(1000)
            const base = player()
            const mark = weapon ? markFor(weapon) : undefined
            // Owned equipment, practiced skills, herbs and injuries are local starting conditions.
            const equipped = player({
              ...base,
              stats: { ...base.stats, vit: 20, mnd: 20, fth: 20 },
              equipment: { ...base.equipment, weapon },
              worn: mark ? { weapon: mark } : {},
              life: { ...base.life, alchemy: lifeExpAt(alchemy), woodcutting: lifeExpAt(8) },
              bag: bagWith(["herb", 3]),
              hpAt: 1000,
              spAt: 1000,
            })
            const stats = derive(equipped)
            const initial = { ...equipped, hp: nearlyFull ? stats.maxHp - 1 : 1, sp: stats.maxSp }
            const initialRecord = { ...initialPlayerRecord(), player: initial }
            const store = durableStorage(initialRecord, 8)
            let actor = new Player.class(store.state, {})
            const record = () => (store.saved.get("__void_durable_state") as { value: PlayerRecord }).value
            const command = { type: "cast" as const, skill }
            const refuses = async (state: PlayerState, reason: string) => {
              const blocked = durableStorage({ ...initialRecord, player: state }, 8)
              const before = structuredClone(blocked.saved.get("__void_durable_state"))
              expect(await new Player.class(blocked.state, {}).run(command)).toEqual({ ok: false, reason })
              expect(blocked.saved.get("__void_durable_state")).toEqual(before)
            }
            await refuses({ ...initial, hp: 0 }, "FALLEN")
            await refuses({ ...initial, hp: stats.maxHp }, "HP_FULL")
            await refuses({ ...initial, sp: definition.sp - 1 }, "SP_SHORT")
            if (definition.kind === "prayer") await refuses({ ...initial, equipment: { ...initial.equipment, weapon: null } }, "NO_WEAPON")
            if (skill === "first-aid") await refuses({ ...initial, bag: bagWith() }, "NO_HERB")
            if (definition.kind === "prayer")
              for (const need of Object.entries(definition.needs)) {
                expect(need[1]).toBeGreaterThan(0)
                if (Object.hasOwn(initial.stats, need[0])) await refuses({ ...initial, stats: { ...initial.stats, [need[0]]: need[1] - 1 } }, "STAT_TOO_LOW")
                else await refuses({ ...initial, life: { ...initial.life, [need[0]]: lifeExpAt(need[1] - 1) } }, "SKILL_TOO_LOW")
              }
            const before = structuredClone(store.saved.get("__void_durable_state"))
            store.failNextSave()
            await expect(actor.run(command)).rejects.toThrow("Storage unavailable")
            expect(store.saved.get("__void_durable_state")).toEqual(before)
            if (restartBeforeRetry) actor = new Player.class(store.state, {})
            const result = await actor.run(command)
            const gain = definition.kind === "prayer" ? Math.floor(definition.heal.base + definition.heal.per * stats.stats[definition.heal.stat]) : firstAid(alchemy, stats.stats.vit)
            const hp = Math.min(stats.maxHp, initial.hp + gain)
            const ready = 1000 + definition.cooldown
            const bag = skill === "first-aid" ? bagWith(["herb", 2]) : initial.bag
            const expected = {
              ...initialRecord,
              deliveryRevision: initialRecord.deliveryRevision + 1,
              player: { ...initial, bag, hp, sp: initial.sp - definition.sp, ready: { ...initial.ready, [skill]: ready }, revision: initial.revision + 1 },
            }
            expect(result).toEqual({ ok: true, state: expected.player, events: [{ type: "cast", skill, hp: hp - initial.hp }] })
            expect(record()).toEqual(expected)
            const committed = structuredClone(store.saved.get("__void_durable_state"))
            expect(await actor.run(command)).toEqual({ ok: false, reason: "COOLDOWN" })
            actor = new Player.class(store.state, {})
            expect(await actor.run(command)).toEqual({ ok: false, reason: "COOLDOWN" })
            vi.setSystemTime(ready - 1)
            expect(await actor.run(command)).toEqual({ ok: false, reason: "COOLDOWN" })
            expect(store.saved.get("__void_durable_state")).toEqual(committed)
            vi.setSystemTime(ready)
            if (hp === stats.maxHp) {
              expect(await actor.run(command)).toEqual({ ok: false, reason: "HP_FULL" })
              expect(store.saved.get("__void_durable_state")).toEqual(committed)
            } else {
              const again = await actor.run(command)
              const nextHp = Math.min(stats.maxHp, hp + gain)
              const second = {
                ...expected,
                deliveryRevision: expected.deliveryRevision + 1,
                player: {
                  ...expected.player,
                  bag: skill === "first-aid" ? bagWith(["herb", 1]) : bag,
                  hp: nextHp,
                  sp: expected.player.sp - definition.sp,
                  ready: { ...expected.player.ready, [skill]: ready + definition.cooldown },
                  revision: expected.player.revision + 1,
                },
              }
              expect(again).toEqual({ ok: true, state: second.player, events: [{ type: "cast", skill, hp: nextHp - hp }] })
              expect(record()).toEqual(second)
              const saved = structuredClone(store.saved.get("__void_durable_state"))
              expect(await new Player.class(store.state, {}).run(command)).toEqual({ ok: false, reason: "COOLDOWN" })
              expect(store.saved.get("__void_durable_state")).toEqual(saved)
            }
          })
}
