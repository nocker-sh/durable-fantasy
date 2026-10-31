import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { Group, PerspectiveCamera, Scene, Vector3 } from "three"
import { SceneFrameRenderer } from "#/world/scene/runtime/scene-frame-renderer"
import { updateSceneWalkers } from "#/world/scene/runtime/update-scene-walkers"
import { updateSceneFog } from "#/world/scene/runtime/update-scene-fog"
import { updateCutaways } from "#/world/scene/update-cutaways"
import { updateMonsters } from "#/world/scene/update-monsters"
import { updateMonsterLabels } from "#/world/scene/runtime/update-monster-labels"
import { daylight } from "#/world/core/daylight"
import type { Layout } from "#/world/maps/layout-types"
import type { V2 } from "#/world/scene/construction/registry"
import type { MonsterView } from "#/world/scene/monsters"
import type { WalkerMotion } from "#/world/scene/runtime/walker-motion"

vi.mock("#/world/scene/runtime/update-scene-walkers", () => ({ updateSceneWalkers: vi.fn() }))
vi.mock("#/world/scene/runtime/update-scene-fog", () => ({ updateSceneFog: vi.fn() }))
vi.mock("#/world/scene/update-cutaways", () => ({ updateCutaways: vi.fn() }))
vi.mock("#/world/scene/update-monsters", () => ({ updateMonsters: vi.fn() }))
vi.mock("#/world/scene/runtime/update-monster-labels", () => ({ updateMonsterLabels: vi.fn() }))
beforeEach(() => vi.stubGlobal("document", { createElement: () => ({}) }))
afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
  vi.unstubAllGlobals()
})

function walker(x: number) {
  const pos: V2 = [x, 3]
  const path: V2[] = []
  return { pos, path, head: 0, t: 0, fig: { pose: vi.fn(), face: vi.fn(), refresh: vi.fn(), root: new Group(), height: 1.5 }, label: document.createElement("div") }
}

function fixture() {
  const events: string[] = []
  const log = (name: string) =>
    vi.fn(() => {
      events.push(name)
    })
  vi.mocked(updateSceneWalkers).mockImplementation(() => {
    events.push("walkers")
  })
  vi.mocked(updateSceneFog).mockImplementation(() => {
    events.push("fog")
  })
  vi.mocked(updateCutaways).mockImplementation(() => {
    events.push("cutaways")
  })
  vi.mocked(updateMonsters).mockImplementation(() => {
    events.push("creatures")
  })
  vi.mocked(updateMonsterLabels).mockImplementation(() => {
    events.push("creature-labels")
  })
  const me = walker(2)
  const remote = walker(4)
  const remotes = new Map([["other", remote]])
  const camera = { camera: new PerspectiveCamera(), distance: 13, focus: new Vector3() }
  const world: { indoor: boolean; layout: Pick<Layout, "fog"> } = { indoor: false, layout: {} }
  const monsters: MonsterView[] = []
  const marker = new Group()
  vi.spyOn(marker.scale, "setScalar").mockImplementation(() => {
    events.push("marker")
    return marker.scale
  })
  const pointer = { hovered: "first", update: log("pointer") }
  const props = {
    world,
    scene: new Scene(),
    town: new Group(),
    camera,
    walkers: { me, remotes, movement: { yaw: 0.7 }, stepWalker: vi.fn<WalkerMotion["step"]>(() => false), placeWalker: vi.fn<WalkerMotion["place"]>() },
    preview: false,
    stepHeld: vi.fn(),
    arrive: vi.fn(),
    marker,
    warps: { update: log("warps") },
    animation: { update: log("animation") },
    cameraFollow: { update: log("camera") },
    shadows: { update: log("shadows") },
    occlusion: {
      update: vi.fn(() => {
        events.push("occlusion")
        return true
      }),
    },
    pointer,
    outlines: { update: log("outlines") },
    smoke: { prepare: log("smoke") },
    draw: log("draw"),
    projection: { place: log("player-label") },
    monsters,
    action: { fighting: null },
    combat: { update: log("combat") },
    residentNames: { update: log("resident-labels") },
    speech: { update: log("speech") },
    ashfall: { update: log("ash") },
    lighting: { minutes: 720 },
    record: log("record"),
  }
  return { props, events, me, remote, remotes }
}

it("keeps drawing between world updates and overlays and reads each clock at its existing phase", () => {
  const f = fixture()
  vi.spyOn(Date, "now").mockImplementation(() => {
    f.events.push("wall")
    return 2000
  })
  vi.spyOn(performance, "now").mockImplementation(() => {
    f.events.push("monotonic")
    return 3000
  })
  const renderer = new SceneFrameRenderer(f.props)
  const render = renderer.render
  const frame = { at: 50, dt: 0.05, elapsed: 0.9, time: 7 }
  render(frame)
  expect(f.events).toEqual([
    "shadows",
    "walkers",
    "marker",
    "warps",
    "animation",
    "camera",
    "fog",
    "occlusion",
    "pointer",
    "outlines",
    "smoke",
    "draw",
    "player-label",
    "player-label",
    "wall",
    "creatures",
    "creature-labels",
    "combat",
    "resident-labels",
    "monotonic",
    "speech",
    "ash",
    "record",
  ])
  expect(updateSceneWalkers).toHaveBeenCalledExactlyOnceWith({
    me: f.me,
    remotes: f.remotes,
    preview: false,
    frame,
    step: f.props.walkers.stepWalker,
    place: f.props.walkers.placeWalker,
    stepHeld: f.props.stepHeld,
    arrive: f.props.arrive,
  })
  expect(f.props.shadows.update).toHaveBeenCalledExactlyOnceWith(50)
  expect(f.props.marker.scale.setScalar).toHaveBeenCalledExactlyOnceWith(1 + Math.sin(7 * 6) * 0.1)
  expect(f.props.warps.update).toHaveBeenCalledExactlyOnceWith(7)
  expect(f.props.animation.update).toHaveBeenCalledExactlyOnceWith(frame)
  expect(f.props.cameraFollow.update).toHaveBeenCalledExactlyOnceWith(0.05)
  expect(f.props.outlines.update).toHaveBeenCalledExactlyOnceWith(true)
  expect(f.props.smoke.prepare).toHaveBeenCalledExactlyOnceWith(f.props.camera.camera)
  expect(updateMonsters).toHaveBeenCalledExactlyOnceWith({ list: f.props.monsters, root: f.props.town, now: 2000, yaw: 0.7, dt: 0.05 })
  expect(updateMonsterLabels).toHaveBeenCalledExactlyOnceWith({ monsters: f.props.monsters, me: f.me, action: f.props.action, place: f.props.projection.place })
  expect(f.props.combat.update).toHaveBeenCalledExactlyOnceWith(2000)
  expect(f.props.speech.update).toHaveBeenCalledExactlyOnceWith(3000)
  expect(f.props.record).toHaveBeenCalledExactlyOnceWith(3000)
})

it("uses the followed camera for indoor cutaways and fog and omits indoor ash", () => {
  const f = fixture()
  f.props.world.indoor = true
  f.props.cameraFollow.update.mockImplementation(() => {
    f.events.push("camera")
    f.props.camera.camera.position.set(2, 3, 4)
    f.props.camera.distance = 17
    f.props.world.layout.fog = { color: 0, near: 2, far: 20 }
  })
  new SceneFrameRenderer({ ...f.props, preview: true, ashfall: null }).render({ at: 0, dt: 0.1, elapsed: 0.1, time: 2 })
  expect(f.events.slice(5, 9)).toEqual(["camera", "cutaways", "fog", "occlusion"])
  expect(updateCutaways).toHaveBeenCalledExactlyOnceWith(f.props.camera.camera.position)
  expect(updateSceneFog).toHaveBeenCalledExactlyOnceWith({ scene: f.props.scene, distance: 17, definition: f.props.world.layout.fog })
  expect(vi.mocked(updateSceneWalkers).mock.calls[0][0].preview).toBe(true)
  expect(f.props.ashfall.update).not.toHaveBeenCalled()
})

it("reads player labels and remote membership after drawing, including replaced figures", () => {
  const f = fixture()
  const added = walker(8)
  f.props.draw.mockImplementation(() => {
    f.remotes.delete("other")
    f.remotes.set("new", added)
    f.me.fig = walker(0).fig
    f.me.fig.height = 2
    f.me.fig.root.position.y = 4
  })
  new SceneFrameRenderer(f.props).render({ at: 0, dt: 0, elapsed: 0, time: 0 })
  expect(f.props.projection.place.mock.calls).toEqual([
    [{ element: f.me.label, pos: f.me.pos, height: 2, ground: 4, offset: 2 }],
    [{ element: added.label, pos: added.pos, height: 1.5, ground: 0, offset: 2 }],
  ])
})

it("reads hover after combat and keeps the pre-speech timestamp through ash and recording", () => {
  const f = fixture()
  const now = { value: 1000 }
  vi.spyOn(performance, "now").mockImplementation(() => now.value)
  f.props.combat.update.mockImplementation(() => {
    f.props.pointer.hovered = "later"
  })
  f.props.residentNames.update.mockImplementation(() => {
    now.value = 2000
  })
  f.props.speech.update.mockImplementation(() => {
    now.value = 3000
    f.props.lighting.minutes = 0
  })
  new SceneFrameRenderer(f.props).render({ at: 0, dt: 0.05, elapsed: 0.4, time: 2 })
  expect(f.props.residentNames.update).toHaveBeenCalledExactlyOnceWith("later")
  expect(f.props.speech.update).toHaveBeenCalledExactlyOnceWith(2000)
  expect(f.props.ashfall.update).toHaveBeenCalledExactlyOnceWith({ dt: 0.05, t: 2, focus: f.props.camera.focus, night: 1 - daylight(0) })
  expect(f.props.record).toHaveBeenCalledExactlyOnceWith(2000)
})

it("does not update overlays or record a frame if drawing throws", () => {
  const f = fixture()
  const failure = Error("draw failed")
  f.props.draw.mockImplementation(() => {
    throw failure
  })
  const renderer = new SceneFrameRenderer(f.props)
  expect(() => renderer.render({ at: 0, dt: 0.05, elapsed: 0.05, time: 0 })).toThrow(failure)
  expect(f.props.projection.place).not.toHaveBeenCalled()
  expect(updateMonsters).not.toHaveBeenCalled()
  expect(f.props.record).not.toHaveBeenCalled()
})
