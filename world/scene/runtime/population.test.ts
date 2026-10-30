vi.mock("../../town/activity-pose", () => ({ activityPose: vi.fn(() => null) }))
import { beforeEach, expect, it, vi } from "vitest"
import { withCleanup } from "#/lib/engine/with-cleanup"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"
const actors = vi.hoisted(() => ({ create: vi.fn() }))
vi.mock("../figure/render", () => ({ FW: 80, FH: 96, SPPU: 48 }))
vi.mock("../figure/animation", () => ({ FRAMES: { idle: 8 } }))
vi.mock("#/world/scene/actor", () => ({
  Actor: class {
    constructor(...args: unknown[]) {
      return actors.create(...args)
    }
  },
}))
vi.mock("../dressing", () => ({ shopBoards: [] }))
vi.mock("#/world/maps/shop-open", () => ({ shopOpen: () => false }))
vi.mock("#/world/scene/construction/registry", () => ({ places: {}, stalls: {} }))
vi.mock("../../town/routines", () => ({
  ROUTINES: { アントン: [{ from: 0 }], ベルタ: [{ from: 0 }] },
}))
vi.mock("#/world/town/work-spot", () => ({ workSpot: () => ({ map: "field", tile: [1, 1] }) }))
vi.mock("#/world/town/spot-at", () => ({ spotAt: () => ({ map: "field", tile: [1, 1] }) }))
vi.mock("../sprite-key", () => ({ lookKey: () => "look" }))
vi.mock("../get-sprite-strip-filename", () => ({ getSpriteStripFilename: () => "strip.png" }))
vi.mock("#/world/lap", () => ({ lap: vi.fn() }))
vi.mock("../../town/residents", () => ({
  RESIDENTS: [
    { name: "アントン", job: "木工" },
    { name: "ベルタ", job: "織り" },
  ],
  RESIDENT_LOOKS: [{}, {}],
}))
vi.mock("./assets", () => ({ spriteManifest: vi.fn(async () => null), SPRITES: "/sprites" }))
import { activityPose } from "#/world/town/activity-pose"
import { createPopulation } from "#/world/scene/runtime/population"
import { spriteManifest } from "#/world/scene/runtime/assets"
import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"
import { SPRITE_RENDER_VERSION } from "#/world/scene/sprite-render-version"
beforeEach(() => {
  vi.mocked(activityPose).mockReset().mockReturnValue(null)
  actors.create.mockReset().mockImplementation(() => ({ fig: { dispose: vi.fn() }, faceTo: vi.fn() }))
  vi.mocked(spriteManifest).mockReset().mockResolvedValue(null)
})
it("owns each resident before constructing the next one so a partial population can be released", async () => {
  const dispose = vi.fn(),
    error = new Error("second resident failed")
  actors.create
    .mockImplementationOnce(() => ({ fig: { dispose }, faceTo: vi.fn() }))
    .mockImplementationOnce(() => {
      throw error
    })
  await expect(
    withCleanup((resources) =>
      createPopulation({
        scene: {} as Parameters<typeof createPopulation>[0]["scene"],
        map: "field",
        world: { centre: [24, 24] } as SceneDefinition,
        progress: vi.fn(),
        tick: async () => {},
        own: (person) => resources.use(person.fig),
      }),
    ),
  ).rejects.toBe(error)
  expect(actors.create).toHaveBeenCalledTimes(2)
  expect(dispose).toHaveBeenCalledOnce()
})

async function bakedChoice(manifest: SpriteManifest) {
  vi.mocked(spriteManifest).mockResolvedValue(manifest)
  await createPopulation({ scene: {} as Parameters<typeof createPopulation>[0]["scene"], map: "field", world: { centre: [24, 24] } as SceneDefinition, progress: vi.fn(), tick: async () => {} })
  return actors.create.mock.calls[0][0].baked as { url(anim: "idle", view: number): string | null } | undefined
}
it("uses baked strips only for the same resident, look, frame size and animation length", async () => {
  const baked = await bakedChoice({ frame: [80, 96], residents: [{ name: "アントン", key: "look", anims: { idle: 8 } }] })
  expect(baked?.url("idle", 0)).toBe(`/sprites/strip.png?renderer=${SPRITE_RENDER_VERSION}&look=look&frame=80x96&frames=8`)
})
it("binds the HTTP image cache to the renderer, look, frame size and animation length", async () => {
  const baked = await bakedChoice({ frame: [80, 96], residents: [{ name: "アントン", key: "look", anims: { idle: 8 } }] })
  const strip = baked?.url("idle", 0)
  if (!strip) throw new Error("Expected a compatible baked strip")
  const address = new URL(strip, "https://example.invalid")
  expect(Object.fromEntries(address.searchParams)).toEqual({ renderer: String(SPRITE_RENDER_VERSION), look: "look", frame: "80x96", frames: "8" })
})
it.each([
  { frame: [81, 96], name: "アントン", key: "look" },
  { frame: [80, 96], name: "別人", key: "look" },
  { frame: [80, 96], name: "アントン", key: "old-look" },
])("rejects incompatible baked resident metadata: %j", async ({ frame, name, key }) => {
  expect(await bakedChoice({ frame: frame as [number, number], residents: [{ name, key, anims: { idle: 8 } }] })).toBeUndefined()
})
it("generates an animation whose baked strip has an outdated frame count", async () => {
  const baked = await bakedChoice({ frame: [80, 96], residents: [{ name: "アントン", key: "look", anims: { idle: 7 } }] })
  expect(baked?.url("idle", 0)).toBeNull()
})

it("preserves a stationary resident's conversational facing outside a designed activity", async () => {
  const faceTo = vi.fn()
  actors.create.mockImplementation(() => ({ pos: [1, 1], fig: { root: { visible: true } }, faceTo }))
  const population = await createPopulation({
    scene: {} as Parameters<typeof createPopulation>[0]["scene"],
    map: "field",
    world: { centre: [24, 24] } as SceneDefinition,
    progress: vi.fn(),
    tick: async () => {},
  })
  faceTo.mockClear()
  population.applySchedule(21 * 60)
  population.applySchedule(21 * 60 + 1)
  expect(faceTo).not.toHaveBeenCalled()
})

it("releases the seated pose when the lesson ends without moving the talk/access cell", async () => {
  const created: { pos: number[]; seat: unknown; anim: string }[] = []
  actors.create.mockImplementation((input: { name: string }) => {
    const actor = { name: input.name, pos: [1, 1], seat: null, anim: "idle", fig: { root: { visible: true } }, faceTo: vi.fn() }
    created.push(actor)
    return actor
  })
  vi.mocked(activityPose).mockImplementation((name, minute) => (name === "アントン" && minute === 1290 ? { facing: null, seat: { at: [2, 3], height: 0.66, heading: Math.PI } } : null))
  const population = await createPopulation({
    scene: {} as Parameters<typeof createPopulation>[0]["scene"],
    map: "field",
    world: { centre: [24, 24] } as SceneDefinition,
    progress: vi.fn(),
    tick: async () => {},
  })
  population.applySchedule(1290)
  expect(created[0].seat).toEqual({ at: [2, 3], height: 0.66, heading: Math.PI })
  expect(created[0].pos).toEqual([1, 1])
  created[0].anim = "sit"
  population.applySchedule(1390)
  expect(created[0].seat).toBeNull()
  expect(created[0].anim).toBe("idle")
  expect(created[0].pos).toEqual([1, 1])
})
