vi.mock("#/world/town/activity-pose", () => ({ activityPose: vi.fn(() => null) }))
import { beforeEach, expect, it, vi } from "vitest"
import { withCleanup } from "#/lib/engine/with-cleanup"
import { Scene } from "three"
import { FIG } from "#/world/scene/figure/display-scale"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import type { Actor } from "#/world/scene/actor"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"
type ActorProps = ConstructorParameters<typeof Actor>[0]
const actors = vi.hoisted(() => ({ create: vi.fn<(props: ActorProps) => object>() }))
const world: SceneDefinition = { centre: [24, 24], layout: SQUARE_LAYOUT, build() {} }
vi.mock("#/world/scene/figure/render", () => ({ FW: 80, FH: 96, SPPU: 48 }))
vi.mock("#/world/scene/figure/animation", () => ({ FRAMES: { idle: 8 } }))
vi.mock("#/world/scene/actor", () => ({
  Actor: class {
    constructor(props: ActorProps) {
      return actors.create(props)
    }
  },
}))
vi.mock("#/world/scene/dressing", () => ({ shopBoards: [] }))
vi.mock("#/world/maps/shop-open", () => ({ shopOpen: () => false }))
vi.mock("#/world/scene/construction/registry", () => ({ places: {}, stalls: {} }))
vi.mock("#/world/town/routines", () => ({
  ROUTINES: { アントン: [{ from: 0 }], ベルタ: [{ from: 0 }] },
}))
vi.mock("#/world/town/work-spot", () => ({ workSpot: () => ({ map: "field", tile: [1, 1] }) }))
vi.mock("#/world/town/spot-at", () => ({ spotAt: vi.fn(() => ({ map: "field", tile: [1, 1] })) }))
vi.mock("#/world/scene/sprite-key", () => ({ lookKey: () => "look" }))
vi.mock("#/world/scene/get-sprite-strip-filename", () => ({ getSpriteStripFilename: () => "strip.png" }))
vi.mock("#/world/lap", () => ({ lap: vi.fn() }))
vi.mock("#/world/town/residents", () => ({
  RESIDENTS: [
    { name: "アントン", job: "木工" },
    { name: "ベルタ", job: "織り" },
  ],
  RESIDENT_LOOKS: [{}, {}],
}))
vi.mock("#/world/scene/runtime/assets", () => ({ spriteManifest: vi.fn(async () => null), SPRITES: "/sprites" }))
import { spotAt } from "#/world/town/spot-at"
import { activityPose } from "#/world/town/activity-pose"
import { createScenePopulation } from "#/world/scene/runtime/create-scene-population"
import { spriteManifest } from "#/world/scene/runtime/assets"
import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"
import { SPRITE_RENDER_VERSION } from "#/world/scene/sprite-render-version"
beforeEach(() => {
  vi.mocked(spotAt)
    .mockReset()
    .mockReturnValue({ map: "field", tile: [1, 1] })
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
      createScenePopulation({
        scene: new Scene(),
        map: "field",
        world: world,
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
  await createScenePopulation({
    scene: new Scene(),
    map: "field",
    world: world,
    progress: vi.fn(),
    tick: async () => {},
  })
  return actors.create.mock.calls[0][0].baked
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
] satisfies { frame: [number, number]; name: string; key: string }[])("rejects incompatible baked resident metadata: %j", async (metadata) => {
  expect(await bakedChoice({ frame: metadata.frame, residents: [{ name: metadata.name, key: metadata.key, anims: { idle: 8 } }] })).toBeUndefined()
})
it("generates an animation whose baked strip has an outdated frame count", async () => {
  const baked = await bakedChoice({ frame: [80, 96], residents: [{ name: "アントン", key: "look", anims: { idle: 7 } }] })
  expect(baked?.url("idle", 0)).toBeNull()
})

it("preserves a stationary resident's conversational facing outside a designed activity", async () => {
  const faceTo = vi.fn()
  actors.create.mockImplementation(() => ({ pos: [1, 1], fig: { root: { visible: true } }, faceTo }))
  const population = await createScenePopulation({
    scene: new Scene(),
    map: "field",
    world: world,
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
  const population = await createScenePopulation({
    scene: new Scene(),
    map: "field",
    world: world,
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

it("keeps original resident indices when an earlier resident never visits this map", async () => {
  vi.mocked(spotAt).mockImplementation((name) => (name === "アントン" ? null : { map: "field", tile: [1, 1] }))
  const population = await createScenePopulation({ scene: new Scene(), map: "field", world, progress: vi.fn(), tick: async () => {} })
  expect(population.ids).toEqual([1])
  expect(population.people).toHaveLength(1)
  expect(population.personOf(1)).toBe(population.people[0])
  expect(population.personOf(0)).toBeUndefined()
  expect(population.personOf(-1)).toBeUndefined()
  expect(Object.isFrozen(population)).toBe(true)
  expect(Object.isFrozen(population.ids)).toBe(true)
  expect(Object.isFrozen(population.people)).toBe(true)
})

it("waits for the loading yield before fetching the manifest or constructing residents", async () => {
  const gate = { resolve: () => {} }
  const pause = new Promise<void>((resolve) => {
    gate.resolve = resolve
  })
  const pending = createScenePopulation({ scene: new Scene(), map: "field", world, progress: vi.fn(), tick: () => pause })
  expect(spriteManifest).not.toHaveBeenCalled()
  expect(actors.create).not.toHaveBeenCalled()
  gate.resolve()
  await pending
  expect(spriteManifest).toHaveBeenCalledOnce()
  expect(actors.create).toHaveBeenCalledTimes(2)
})

it("does not construct residents when the manifest request fails", async () => {
  const failure = Error("manifest failure")
  vi.mocked(spriteManifest).mockRejectedValue(failure)
  await expect(createScenePopulation({ scene: new Scene(), map: "field", world, progress: vi.fn(), tick: async () => {} })).rejects.toBe(failure)
  expect(actors.create).not.toHaveBeenCalled()
})

it("passes the authored figure scale and acquires ownership before initial facing", async () => {
  const own = vi.fn()
  const faceTo = vi.fn(() => expect(own).toHaveBeenCalled())
  actors.create.mockImplementation(() => ({ fig: { dispose: vi.fn() }, faceTo }))
  const population = await createScenePopulation({ scene: new Scene(), map: "field", world: { ...world, figureMetres: 2 }, progress: vi.fn(), tick: async () => {}, own })
  expect(actors.create.mock.calls[0][0].figureScale).toBe(2 / FIG)
  expect(own).toHaveBeenCalledTimes(2)
  expect(population.people.every((person) => person.nextSay === Infinity)).toBe(true)
})
