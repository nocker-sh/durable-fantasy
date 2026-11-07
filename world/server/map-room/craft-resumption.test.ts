import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "#/world/test/durable-storage"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { handleCraft } from "#/world/server/map-room/handle-craft"
import { STATIONS } from "#/world/town/stations"
import { RECIPES } from "#/world/core/recipes/catalog"
import type { Recipe } from "#/world/core/recipes/definition"
import { lifeThresholds } from "#/world/core/life-thresholds"
import { STAMINA_PER_CRAFT } from "#/world/core/crafting-rules"
import { countItem } from "#/world/core/count-item"
import { REACH } from "#/world/core/gather-rules"
import type { Ctx } from "#/world/server/map-room/context"
import type { ServerMessage } from "#/world/protocol"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function fixture(props?: { recipe: Recipe; roll: number }) {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  vi.spyOn(Math, "random").mockReturnValue(props?.roll ?? 0.5)
  const station = STATIONS.find((entry) => entry.kind === (props?.recipe.station ?? "hearth"))!
  expect(station).toBeDefined()
  const base = player()
  const initial = props
    ? player({
        profileComplete: true,
        sitting: true,
        gold: station.fee * 3,
        stamina: 100,
        stats: { ...base.stats, str: 40 },
        life: { ...base.life, [props.recipe.skill]: lifeThresholds[props.recipe.min] },
        bag: bagWith(...props.recipe.inputs.map((input): Parameters<typeof bagWith>[number] => [input.item, input.count * 2])),
      })
    : player({ profileComplete: true, gold: 20, bag: bagWith(["cabbage", 2], ["onion", 2], ["firewood", 2]) })
  const store = durableStorage({ ...initialPlayerRecord(), player: initial, location: { world: 1, map: station.map, route: [station.cell], since: 1000, connection: "connection" } }, 8)
  const actors = { current: new Player.class(store.state, {}) }
  // The RPC stub is replaced only at transport resolution; requests use the real durable actor.
  vi.spyOn(Player, "get").mockImplementation(() => actors.current as unknown as ReturnType<typeof Player.get>)
  const send = vi.fn(async (_message: ServerMessage) => {})
  const context = {
    ctx: { connection: { id: "connection", send } },
    key: { world: 1, map: station.map },
    me: { owner: "owner", player: mapPlayer("connection", initial, [...station.cell]), route: [[...station.cell]], since: 1000, said: [], engaged: null },
    save: vi.fn(),
  } as unknown as Ctx
  const message = { type: "craft" as const, seq: 1, station: station.id, recipe: props?.recipe.id ?? "cabbage-soup" }
  return {
    store,
    context,
    send,
    message,
    initial,
    station,
    get actor() {
      return actors.current
    },
    restart: () => {
      actors.current = new Player.class(store.state, {})
    },
  }
}

it.each([false, true])("a repeated craft request cannot pay or produce twice after restart: lostReply=%s", async (lostReply) => {
  const f = fixture()
  if (lostReply) f.send.mockRejectedValueOnce(new Error("Response lost"))
  if (lostReply) await expect(handleCraft(f.context, f.message)).rejects.toThrow("Response lost")
  else await handleCraft(f.context, f.message)
  expect(f.send.mock.calls[0][0]).toMatchObject({ result: { ok: true, events: [{ type: "crafted" }] } })
  const first = f.send.mock.calls[0][0]
  if (first.type !== "result" || !first.result.ok) throw new Error("Craft did not complete")
  const saved = structuredClone(f.store.saved.get("__void_durable_state"))
  f.restart()
  await handleCraft(f.context, f.message)
  expect(f.store.saved.get("__void_durable_state")).toEqual(saved)
  expect(f.send.mock.calls.at(-1)![0]).toEqual({ type: "result", seq: f.message.seq, result: { ...first.result, events: [] } })
})

it("a failed craft save can retry on the same live actor without consuming twice", async () => {
  const f = fixture()
  const initial = structuredClone(f.store.saved.get("__void_durable_state"))
  f.store.failNextSave()
  await expect(handleCraft(f.context, f.message)).rejects.toThrow("Storage unavailable")
  expect(f.store.saved.get("__void_durable_state")).toEqual(initial)
  expect(f.send).not.toHaveBeenCalled()
  await handleCraft(f.context, f.message)
  const completed = structuredClone(f.store.saved.get("__void_durable_state"))
  await handleCraft(f.context, f.message)
  expect(f.store.saved.get("__void_durable_state")).toEqual(completed)
  expect(f.send.mock.calls[0][0]).toMatchObject({ result: { ok: true, events: [{ type: "crafted" }] } })
  expect(f.send.mock.calls[1][0]).toMatchObject({ result: { ok: true, events: [] } })
})

for (const roll of [0, 0.5])
  it.each(RECIPES)(`$id: station refusal, failed persistence and a lost ${roll === 0 ? "spoiled" : "crafted"} reply preserve one result`, async (recipe) => {
    // Materials, skill, strength and the position at the real station are local starting conditions.
    const f = fixture({ recipe, roll })
    const before = structuredClone(f.store.saved.get("__void_durable_state"))
    f.context.me.route = [[f.station.cell[0] + REACH + 2, f.station.cell[1]]]
    await handleCraft(f.context, f.message)
    expect(f.send).toHaveBeenLastCalledWith({ type: "result", seq: 1, result: { ok: false, reason: "TOO_FAR" } })
    expect(f.store.saved.get("__void_durable_state")).toEqual(before)
    expect(f.context.save).not.toHaveBeenCalled()
    expect(Math.random).not.toHaveBeenCalled()
    f.context.me.route = [[...f.station.cell]]
    f.send.mockClear()
    f.store.failNextSave()
    await expect(handleCraft(f.context, f.message)).rejects.toThrow("Storage unavailable")
    expect(f.store.saved.get("__void_durable_state")).toEqual(before)
    expect(f.send).not.toHaveBeenCalled()
    expect(f.context.save).not.toHaveBeenCalled()
    f.send.mockRejectedValueOnce(new Error("Response lost"))
    await expect(handleCraft(f.context, f.message)).rejects.toThrow("Response lost")
    const first = f.send.mock.calls[0][0]
    if (first.type !== "result" || !first.result.ok) throw new Error(`${recipe.id}: craft did not commit`)
    expect(first.result.events).toHaveLength(1)
    expect(first.result.events[0].type).toBe(roll === 0 ? "spoiled" : "crafted")
    expect(first.result.state.gold).toBe(f.initial.gold - f.station.fee)
    expect(first.result.state.stamina).toBe(f.initial.stamina - STAMINA_PER_CRAFT)
    expect(first.result.state.sitting).toBe(false)
    for (const input of recipe.inputs)
      expect(countItem(first.result.state.bag, input.item)).toBe(countItem(f.initial.bag, input.item) - input.count + (roll !== 0 && input.item === recipe.output.item ? recipe.output.count : 0))
    expect(countItem(first.result.state.bag, recipe.output.item)).toBe(
      countItem(f.initial.bag, recipe.output.item) -
        recipe.inputs.filter((input) => input.item === recipe.output.item).reduce((sum, input) => sum + input.count, 0) +
        (roll === 0 ? 0 : recipe.output.count),
    )
    expect(f.context.save).toHaveBeenCalledExactlyOnceWith({ sitting: false })
    const completed = structuredClone(f.store.saved.get("__void_durable_state"))
    f.restart()
    vi.mocked(Math.random).mockReturnValue(roll === 0 ? 0.5 : 0)
    await handleCraft(f.context, f.message)
    expect(f.send).toHaveBeenLastCalledWith({ type: "result", seq: 1, result: { ...first.result, events: [] } })
    expect(f.store.saved.get("__void_durable_state")).toEqual(completed)
  })
