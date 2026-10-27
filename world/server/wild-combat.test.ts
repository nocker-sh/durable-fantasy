import { afterEach, expect, it, vi } from "vitest"
import { Wild } from "../../durable-objects/wild.ts"
import { apply } from "../core/apply.ts"
import { MONSTER_KINDS, SPAWNS } from "../core/monsters.ts"
import { player } from "../test/helpers.ts"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const run = vi.hoisted(() => vi.fn())
vi.mock("../../durable-objects/player.ts", () => ({ Player: { get: (owner: string) => ({ run: (command: unknown) => run(owner, command) }) } }))

const spawn = SPAWNS.find((s) => s.kind === "slime")!
function fixture() {
  const saved = new Map<string, unknown>()
  const context = {
    id: { toString: () => "test-field" },
    blockConcurrencyWhile: <T>(fn: () => Promise<T>) => fn(),
    storage: {
      get: async (key: string) => structuredClone(saved.get(key)),
      put: async (key: string, value: unknown) => {
        saved.set(key, structuredClone(value))
      },
    },
  }
  return () => new Wild.class(context as unknown as DurableObjectState, {})
}
const fighter = () => {
  const base = player()
  return player({ stats: { ...base.stats, str: 8 }, equipment: { ...base.equipment, weapon: "short-sword" }, sp: 20, spAt: Date.now() })
}

afterEach(() => {
  vi.useRealTimers()
  vi.resetAllMocks()
})

it("serializes competing arts across a delayed payment and charges only the accepted hunter", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const restart = fixture(),
    wild = restart()
  const before = fighter()
  let release!: () => void
  let entered!: () => void
  const paying = new Promise<void>((resolve) => {
    entered = resolve
  })
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  run.mockImplementation(async (_owner, command) => {
    entered()
    await gate
    return apply(before, command, { now: Date.now() })
  })
  const first = wild.strike(spawn.id, 1, "hunter", "lunge")
  await paying
  const second = wild.strike(spawn.id, 1, "other", "lunge")
  release()
  const [accepted, rejected] = await Promise.all([first, second])
  expect(run).toHaveBeenCalledTimes(1)
  expect(run).toHaveBeenCalledWith("hunter", { type: "art", skill: "lunge" })
  expect(accepted.refused).toBe(false)
  expect(accepted.payment?.ok && accepted.payment.state.sp).toBe(16)
  expect(rejected).toMatchObject({ refused: true, reason: "TAKEN" })
  expect(rejected.payment).toBeUndefined()
  expect((await restart().state(spawn.map))[spawn.id].hp).toBe(MONSTER_KINDS[spawn.kind].hp - 1)
})

it("does not pay for a defeated target, including after the wild object restarts", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const restart = fixture()
  await restart().strike(spawn.id, MONSTER_KINDS[spawn.kind].hp, "hunter")
  for (const owner of ["hunter", "other"]) {
    const result = await restart().strike(spawn.id, 20, owner, "lunge")
    expect(result).toMatchObject({ refused: true, reason: "TARGET_GONE" })
  }
  expect(run).not.toHaveBeenCalled()
})

it("does not damage or claim a target when the skill payment is rejected", async () => {
  const wild = fixture()()
  run.mockResolvedValue({ ok: false, reason: "SP_SHORT" })
  const refused = await wild.strike(spawn.id, 20, "hunter", "lunge")
  expect(refused).toMatchObject({ refused: true, reason: "SP_SHORT", hp: MONSTER_KINDS[spawn.kind].hp })
  const next = await wild.strike(spawn.id, 0, "other")
  expect(next.refused).toBe(false)
  expect(next.hp).toBe(MONSTER_KINDS[spawn.kind].hp)
  expect((await wild.strike(spawn.id, 1, "hunter")).reason).toBe("TAKEN")
})
