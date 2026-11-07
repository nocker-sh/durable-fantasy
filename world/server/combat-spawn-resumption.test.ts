import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { Wild } from "#/durable-objects/wild"
import { MONSTER_KINDS, SPAWNS, FIGHT_STAMINA } from "#/world/core/monsters"
import { emptyBag } from "#/world/core/empty-bag"
import { expToNext } from "#/world/core/exp-to-next"
import { initialWildRecord } from "#/world/server/initial-wild-record"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { WildRecord } from "#/world/server/wild-record"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const cases = SPAWNS.flatMap((spawn) => [0, 1 - Number.EPSILON].flatMap((roll) => (["recipient-save", "source-save"] as const).map((failure) => ({ spawn, roll, failure }))))
it.each(cases)("$spawn.id / $roll / $failure: saved loot is delivered once without rerolling", async ({ spawn, roll, failure }) => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const random = vi.spyOn(Math, "random").mockReturnValue(roll)
  const record = initialPlayerRecord()
  // Start at the accepted-strike boundary with room to carry every canonical drop.
  record.player = { ...record.player, bag: emptyBag(), stats: { ...record.player.stats, str: 20 } }
  const before = structuredClone(record.player)
  const playerStore = durableStorage(record, 8)
  const wildStore = durableStorage(initialWildRecord(), 3)
  let recipient = new Player.class(playerStore.state, {})
  let source = new Wild.class(wildStore.state, {})
  vi.spyOn(Player, "get").mockImplementation(() => recipient as unknown as ReturnType<typeof Player.get>)
  await recipient.read()
  await source.state(spawn.map)
  const kind = MONSTER_KINDS[spawn.kind]
  const expected = kind.drops.filter((drop) => roll < drop.chance).map((drop) => drop.item)
  const request = await source.beginStrike({ target: spawn.id, damage: kind.hp, owner: "hunter", request: "defeat" })
  expect(request.ok).toBe(true)
  if (!request.ok) throw Error(request.reason)
  const struck = await source.strike("hunter", request.id)
  expect(struck).toMatchObject({ refused: false, beaten: true, hp: 0, back: 1000 + kind.respawn * 1000 })
  const saved = (wildStore.saved.get("__void_durable_state") as { value: WildRecord }).value
  expect(saved.deliveries.hunter).toHaveLength(1)
  expect(saved.deliveries.hunter[0].command).toEqual({ type: "loot", monster: spawn.id, exp: kind.exp, items: expected })
  expect((await recipient.read()).bag).toEqual(before.bag)
  if (failure === "recipient-save") {
    playerStore.failNextSave()
    expect(await source.deliverStrike("hunter", request.id)).toEqual([])
  } else {
    wildStore.failNextSave()
    await expect(source.deliverStrike("hunter", request.id)).rejects.toThrow("Storage unavailable")
  }
  const rolls = random.mock.calls.length
  recipient = new Player.class(playerStore.state, {})
  source = new Wild.class(wildStore.state, {})
  await source.alarm()
  const after = await recipient.read()
  expect(after.stamina).toBe(before.stamina - FIGHT_STAMINA)
  const counts: Record<string, number> = {}
  for (const item of expected) counts[item] = (counts[item] ?? 0) + 1
  const actual: Record<string, number> = {}
  for (const slot of after.bag) if (slot) actual[slot.item] = (actual[slot.item] ?? 0) + slot.count
  expect(actual).toEqual(counts)
  let total = after.exp - before.exp
  for (let level = before.level; level < after.level; level++) total += expToNext(level)
  expect(total).toBe(kind.exp)
  expect(after.gold).toBe(before.gold)
  const delivered = structuredClone(playerStore.saved.get("__void_durable_state"))
  await source.deliverStrike("hunter", request.id)
  await source.alarm()
  expect(playerStore.saved.get("__void_durable_state")).toEqual(delivered)
  expect(random).toHaveBeenCalledTimes(rolls)
  expect((wildStore.saved.get("__void_durable_state") as { value: WildRecord }).value.deliveries).toEqual({})
  expect((await source.state(spawn.map))[spawn.id]).toEqual({ hp: 0, back: 1000 + kind.respawn * 1000 })
})
