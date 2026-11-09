import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { MAKERS } from "#/world/core/makers"
import { usualMaker } from "#/world/core/usual-maker"
import { effectOf } from "#/world/core/effect-of"
import { isMedicine } from "#/world/core/is-medicine"
import { MEDICINE_KEY, MEDICINE_WAIT_MS } from "#/world/core/medicine-rules"
import { MAX_STAMINA } from "#/world/core/player-rules"
import { derive } from "#/world/core/derive"
import { emptyBag } from "#/world/core/empty-bag"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

for (const item of ITEM_IDS.filter((id) => ITEMS[id].use))
  // a made thing saved without a maker is read as its usual maker's (mark-old-goods.ts)
  for (const by of new Set([ITEMS[item].made ? usualMaker(item) : undefined, ...Object.keys(MAKERS).filter((maker) => MAKERS[maker][item])]))
    for (const q of ITEMS[item].made ? ([0, 1, 2, 3] as const) : [undefined])
      it(`${item}: quality=${q}, maker=${by} retains paid effects after save failure and restart`, async () => {
        vi.useFakeTimers()
        vi.setSystemTime(1000)
        const stack = { item, count: 2, ...(by ? { by } : {}), ...(q !== undefined ? { q } : {}) }
        // Goods, missing vitals and the clock are local conditions, not a crafting or combat route.
        const initial = player({ hp: 1, sp: 0, stamina: 0, hpAt: 1000, spAt: 1000, bag: [stack, ...emptyBag(23)] })
        const store = durableStorage({ ...initialPlayerRecord(), player: initial }, 8)
        const actors = { current: new Player.class(store.state, {}) }
        const command = { type: "use" as const, slot: 0, expectedStack: structuredClone(stack) }
        const effect = effectOf(item, q ?? 1, by)
        const stats = derive(initial)
        const healthy = {
          ...initial,
          hp: stats.maxHp,
          sp: stats.maxSp,
          stamina: MAX_STAMINA,
          warmUntil: effect.warm > 0 ? 1000 + effect.warm * 60_000 + 1 : 0,
          focusAt: effect.focus > 0 ? 1000 : 0,
          focusUntil: effect.focus > 0 ? 1000 + effect.focus * 60_000 + 1 : 0,
        }
        const refused = durableStorage({ ...initialPlayerRecord(), player: healthy }, 8)
        const healthyBefore = structuredClone(refused.saved.get("__void_durable_state"))
        const food = effect.full > 0 || effect.warm > 0 || effect.focus > 0
        expect(await new Player.class(refused.state, {}).run(command)).toEqual({ ok: false, reason: food ? "NOTHING_TO_GAIN" : effect.sp > 0 && effect.hp === 0 ? "SP_FULL" : "HP_FULL" })
        expect(refused.saved.get("__void_durable_state")).toEqual(healthyBefore)
        if (effect.full > 0) {
          const full = durableStorage({ ...initialPlayerRecord(), player: { ...initial, full: 100, fullAt: 1000 } }, 8)
          const fullBefore = structuredClone(full.saved.get("__void_durable_state"))
          expect(await new Player.class(full.state, {}).run(command)).toEqual({ ok: false, reason: "TOO_FULL" })
          expect(full.saved.get("__void_durable_state")).toEqual(fullBefore)
        }
        const before = structuredClone(store.saved.get("__void_durable_state"))
        store.failNextSave()
        await expect(actors.current.run(command)).rejects.toThrow("Storage unavailable")
        expect(store.saved.get("__void_durable_state")).toEqual(before)
        actors.current = new Player.class(store.state, {})
        const used = await actors.current.run(command)
        if (!used.ok) throw new Error(`${item}: ${used.reason}`)
        const hp = Math.min(stats.maxHp, initial.hp + effect.hp)
        const sp = Math.min(stats.maxSp, effect.sp)
        const stamina = Math.min(MAX_STAMINA, effect.stamina)
        expect(used.events).toEqual([{ type: "used", item, hp: hp - initial.hp, sp, stamina, warm: effect.warm, ...(effect.focus > 0 ? { focus: effect.focus } : {}), ...(by ? { by } : {}) }])
        expect(used.state).toEqual({
          ...initial,
          revision: used.state.revision,
          hp,
          sp,
          stamina,
          full: effect.full,
          fullAt: effect.full > 0 ? 1000 : initial.fullAt,
          warmUntil: effect.warm > 0 ? 1000 + effect.warm * 60_000 : initial.warmUntil,
          focusAt: effect.focus > 0 ? 1000 : initial.focusAt,
          focusUntil: effect.focus > 0 ? 1000 + effect.focus * 60_000 : initial.focusUntil,
          ready: isMedicine(item) ? { ...initial.ready, [MEDICINE_KEY]: 1000 + MEDICINE_WAIT_MS } : initial.ready,
          bag: [{ ...stack, count: 1 }, ...emptyBag(23)],
        })
        const saved = structuredClone(store.saved.get("__void_durable_state"))
        actors.current = new Player.class(store.state, {})
        expect(await actors.current.run(command)).toEqual({ ok: false, reason: "ITEM_CHANGED" })
        expect(store.saved.get("__void_durable_state")).toEqual(saved)
        // A refused replay also decodes the saved player; a later accepted command publishes those exact effects.
        const rested = await actors.current.run({ type: "sit" })
        if (!rested.ok) throw new Error(rested.reason)
        expect(rested.state).toEqual({ ...used.state, sitting: true, revision: rested.state.revision })
      })
