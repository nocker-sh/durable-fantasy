import { afterEach, expect, it, vi } from "vitest"
import { Nature } from "#/durable-objects/nature"
import { Player } from "#/durable-objects/player"
import { NODES } from "#/world/core/gather"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { emptyBag } from "#/world/core/empty-bag"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { emptyNature } from "#/world/core/nature/empty-nature"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { GATHER_EXP, LIFE_CAP } from "#/world/core/life-rules"
import { leftAt } from "#/world/core/nature/left-at"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"
import type { NatureRecord } from "#/world/server/nature-record-types"
import type { GatherRequest } from "#/world/core/gather-receipt-types"
import type { PlayerState } from "#/world/core/player-types"
import type { NodeDef } from "#/world/core/gather-types"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const now = 1000
async function fixture(node: NodeDef, initial: PlayerState) {
  const location = { world: 1, map: node.map, route: [node.cell], since: now, connection: "connection" }
  const playerStore = durableStorage({ ...initialPlayerRecord(), player: initial, location }, 8)
  const natureStore = durableStorage({ nature: emptyNature() }, 0)
  const actors = { recipient: new Player.class(playerStore.state, {}), source: new Nature.class(natureStore.state, {}) }
  let lost = false
  const target = {
    ownsConnection: (id: string) => actors.recipient.ownsConnection(id),
    receiveGather: async (key: string, request: GatherRequest) => {
      const result = await actors.recipient.receiveGather(key, request)
      if (lost) {
        lost = false
        throw Error("Response lost")
      }
      return result
    },
  }
  vi.spyOn(Player, "get").mockReturnValue(target as unknown as ReturnType<typeof Player.get>)
  await actors.source.left(node.map)
  await actors.recipient.read()
  return {
    actors,
    playerStore,
    natureStore,
    loseReply: () => {
      lost = true
    },
    state: () => (natureStore.saved.get("__void_durable_state") as { value: NatureRecord }).value,
    restart: () => {
      actors.recipient = new Player.class(playerStore.state, {})
      actors.source = new Nature.class(natureStore.state, {})
    },
  }
}

for (const node of NODES) {
  const tools = ITEM_IDS.filter((item) => ITEMS[item].tool?.skill === node.skill)
  if ((node.needsTool && !tools.length) || !node.yields.some((entry) => (entry.level ?? 0) <= LIFE_CAP)) throw Error(`${node.id}: no usable gathering case`)
  // Later milestone rewards are intentionally unavailable at the current skill cap.
  for (const yielded of node.yields.filter((entry) => (entry.level ?? 0) <= LIFE_CAP))
    for (const level of new Set([yielded.level ?? 0, LIFE_CAP]))
      for (const tool of node.needsTool ? tools : [null, ...tools])
        for (const held of tool && ITEMS[tool].equip?.part === "weapon" ? [false, true] : [false])
          for (const dur of tool ? [1, 2] : [0])
            it(`${node.id}/${yielded.item}/${tool}, held=${held}, dur=${dur}, level=${level}: saved delivery recovers once`, async () => {
              vi.useFakeTimers()
              vi.setSystemTime(now)
              const open = node.yields.filter((entry) => (entry.level ?? 0) <= level)
              const index = open.indexOf(yielded)
              expect(index).toBeGreaterThanOrEqual(0)
              const total = open.reduce((sum, entry) => sum + entry.weight, 0)
              const roll = (open.slice(0, index).reduce((sum, entry) => sum + entry.weight, 0) + yielded.weight / 2) / total
              const random = vi.spyOn(Math, "random").mockReturnValue(roll)
              const bag = [...emptyBag()]
              const mark = { q: 2 as const, by: "採集の作り手", dur }
              if (tool && !held) bag[0] = { item: tool, count: 1, ...mark }
              // Authored tools and near-threshold skill experience are local conditions,
              // including future tools; no acquisition or map-traversal route is claimed.
              const initial = player({
                bag,
                equipment: { ...emptyEquipment(), weapon: held ? tool : null },
                worn: held ? { weapon: mark } : {},
                hpAt: now,
                spAt: now,
                fullAt: now,
                warmUntil: now + 60_000,
                sitting: true,
                life: { ...player().life, [node.skill]: level === LIFE_CAP ? lifeExpAt(LIFE_CAP) : lifeExpAt(level + 1) - 5 },
              })
              const baseline = await fixture(node, initial)
              const request = { owner: "owner", connection: "connection", seq: 1, node: node.id }
              const begun = await baseline.actors.source.beginGather(request)
              if (!begun.ok) throw Error(begun.reason)
              const success = await baseline.actors.source.finishGather("owner", begun.id)
              if (!success.ok) throw Error(success.reason)
              expect(success.events).toHaveLength(1)
              expect(success.events[0]).toMatchObject({ type: "gathered", item: yielded.item, broke: dur === 1 ? tool : null })
              expect(success.state.stamina).toBe(initial.stamina - 1)
              expect(success.state.sitting).toBe(false)
              expect(success.state.life[node.skill]).toBe(Math.min(lifeExpAt(LIFE_CAP), initial.life[node.skill] + GATHER_EXP))
              const gathered = success.state.bag.filter((stack) => stack?.item === yielded.item)
              expect(gathered).toHaveLength(1)
              expect(gathered[0]!.count).toBeGreaterThanOrEqual(level >= 8 ? 3 : level >= 4 ? 2 : 1)
              expect(gathered[0]!.count).toBeLessThanOrEqual(4)
              if (held) {
                expect(success.state.equipment.weapon).toBe(dur === 1 ? null : tool)
                expect(success.state.worn.weapon).toEqual(dur === 1 ? undefined : { ...mark, dur: dur - 1 })
              } else expect(success.state.bag[0]).toEqual(!tool || dur === 1 ? gathered[0] : { item: tool, count: 1, ...mark, dur: dur - 1 })
              const baselineRead = await baseline.actors.recipient.read()
              const expectedPlayer = structuredClone(baseline.playerStore.saved.get("__void_durable_state") as { value: PlayerRecord })
              const expectedNature = structuredClone(baseline.natureStore.saved.get("__void_durable_state"))
              for (const failure of ["recipient-save", "source-save", "reply"] as const) {
                const run = await fixture(node, initial)
                const reserved = await run.actors.source.beginGather(request)
                if (!reserved.ok) throw Error(reserved.reason)
                const beforePlayer = structuredClone(run.playerStore.saved.get("__void_durable_state"))
                const beforeNature = structuredClone(run.natureStore.saved.get("__void_durable_state"))
                if (failure === "recipient-save") run.playerStore.failNextSave()
                if (failure === "source-save") run.natureStore.failNextSave()
                if (failure === "reply") run.loseReply()
                await expect(run.actors.source.finishGather("owner", reserved.id)).rejects.toThrow(failure === "reply" ? "Response lost" : "Storage unavailable")
                expect(run.state().jobs.owner.phase).toBe("pending")
                expect(run.natureStore.saved.get("__void_durable_state")).toEqual(beforeNature)
                expect(run.playerStore.saved.get("__void_durable_state")).toEqual(
                  failure === "recipient-save" ? beforePlayer : { ...expectedPlayer, value: { ...expectedPlayer.value, player: success.state } },
                )
                run.restart()
                await run.actors.source.alarm()
                const resumed = await run.actors.recipient.read()
                // Every successful read/delivery publishes a fresh revision, including receipt replay.
                const revision = baselineRead.revision + (failure === "recipient-save" ? 0 : 1)
                expect(resumed).toEqual({ ...baselineRead, revision })
                expect(run.playerStore.saved.get("__void_durable_state")).toEqual({
                  ...expectedPlayer,
                  value: { ...expectedPlayer.value, player: { ...baselineRead, revision } },
                })
                expect(run.natureStore.saved.get("__void_durable_state")).toEqual(expectedNature)
                expect(leftAt(run.state().nature, node.id, now)).toBe(node.max - 1)
                const repeat = await run.actors.source.finishGather("owner", reserved.id)
                expect(repeat.ok).toBe(true)
                if (repeat.ok) {
                  expect(repeat.events).toEqual([])
                  expect(repeat.state).toEqual({ ...resumed, revision: revision + 1 })
                }
                expect(await run.actors.recipient.read()).toEqual({ ...resumed, revision: revision + 2 })
                expect((await run.actors.recipient.deliveryUpdate(null)).revision).toBe(1)
              }
              expect(random).toHaveBeenCalledTimes(4)
            })
}
