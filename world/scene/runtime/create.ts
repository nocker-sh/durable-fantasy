import { SceneFrameRenderer } from "#/world/scene/runtime/scene-frame-renderer"
import { SceneShadowUpdates } from "#/world/scene/runtime/scene-shadow-updates"
import { SceneOutlines } from "#/world/scene/runtime/scene-outlines"
import { pickVisibleOwner } from "#/lib/graphics/pick-visible-owner"
import { ScenePosture } from "#/world/scene/runtime/scene-posture"
import { SceneCombatFeedback } from "#/world/scene/runtime/scene-combat-feedback"
import { SceneHitLabels } from "#/world/scene/runtime/scene-hit-labels"
import { SceneCameraFollow } from "#/world/scene/runtime/scene-camera-follow"
import { SceneWorldAnimation } from "#/world/scene/runtime/scene-world-animation"
import { SceneResidentNames } from "#/world/scene/runtime/scene-resident-names"
import { createResidentNameplate } from "#/world/scene/runtime/create-resident-nameplate"
import { SceneSpeech } from "#/world/scene/runtime/scene-speech"
import { SceneInteractions } from "#/world/scene/runtime/scene-interactions"
import { SceneMovement } from "#/world/scene/runtime/scene-movement"
import { createSceneRenderer } from "#/world/scene/runtime/create-scene-renderer"
import { createSceneRoot } from "#/world/scene/runtime/create-scene-root"
import { createSceneCamera } from "#/world/scene/runtime/create-scene-camera"
import { createWalkMarkers } from "#/world/scene/runtime/create-walk-markers"
import { withCleanup } from "#/lib/engine/with-cleanup"
import { type CleanupStack } from "#/lib/engine/cleanup-stack"
import type { SceneOptions } from "#/world/scene/runtime/scene-options"
import { SceneBuildQueue } from "#/world/scene/runtime/scene-build-queue"
import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { SceneOcclusion } from "#/world/scene/runtime/scene-occlusion"
import { SceneLabelProjection } from "#/world/scene/runtime/scene-label-projection"
import { PendingAction } from "#/world/scene/runtime/action-target"
import { WarpMarkers } from "#/world/scene/runtime/warps"
import { SceneFrameLoop } from "#/world/scene/runtime/scene-frame-loop"
import { keyTurn } from "#/world/scene/key-turn"
import { SceneGathering } from "#/world/scene/runtime/scene-gathering"
import { ScenePointer } from "#/world/scene/runtime/scene-pointer"
import { createPreviewControls } from "#/world/scene/runtime/preview"
import { SceneWalkers } from "#/world/scene/runtime/scene-walkers"
import { DioramaPostProcessing } from "#/lib/graphics/post-processing"
import { mergeStatic } from "#/lib/graphics/merge-static"
import * as THREE from "three"
import { initWalk } from "#/world/scene/init-walk"
import { walkH } from "#/world/scene/walk-h"
import { setLayout } from "#/world/scene/set-layout"
import { burst } from "#/world/scene/burst"
import { makeMonsters } from "#/world/scene/make-monsters"
import { SceneCombat } from "#/world/scene/runtime/scene-combat"
import { groundOf } from "#/world/scene/ground-of"
import { occluders, houseGlows, lamps, stalls, movingObjects } from "#/world/scene/construction/registry"
import { resetRegistries } from "#/world/scene/construction/reset-registries"
import type { V2 } from "#/world/scene/construction/registry"
import type { Actor } from "#/world/scene/actor"
import { FIG } from "#/world/scene/figure/display-scale"
import { critters } from "#/world/scene/critters"
import { spawnAnimals } from "#/world/scene/spawn-animals"
import { lap } from "#/world/lap"
import { Ashfall } from "#/world/scene/ashfall"
import { dustAll } from "#/world/scene/dust-all"
import { MAP_SCENES } from "#/world/scene/runtime/definitions"
import { diorama } from "#/world/scene/runtime/settings"
import { createSceneTerrain } from "#/world/scene/runtime/create-scene-terrain"
import { createEnvironment } from "#/world/scene/runtime/helpers/lighting/create-environment"
import { createLighting } from "#/world/scene/runtime/helpers/lighting/create-lighting"
import { createPopulation } from "#/world/scene/runtime/population"
import type { SceneEvents } from "#/world/scene/runtime/types"

const builds = new SceneBuildQueue()

async function createSceneRuntime(map: string, progress: (t: string) => void, input: { signal?: AbortSignal; options?: SceneOptions } = {}) {
  input.signal?.throwIfAborted()
  progress("地面を描いています…")
  // Painting can overlap; only construction touches shared layout and scene registries.
  const ground = await groundOf(map)
  lap("scene: ground painted")
  return builds.run(() => buildSceneRuntime({ map, progress, ground, options: input.options ?? {} }), input.signal)
}

type BuildProps = { map: string; progress: (text: string) => void; ground: PixBuf; options: SceneOptions }

async function buildSceneRuntime(props: BuildProps) {
  return withCleanup((resources) => assembleSceneRuntime({ ...props, resources }))
}

async function assembleSceneRuntime(props: BuildProps & { resources: CleanupStack }) {
  const map = props.map,
    progress = props.progress,
    ground = props.ground,
    resources = props.resources,
    options = props.options,
    preview = !!options.preview
  const world = MAP_SCENES[map] ?? MAP_SCENES.phanthiet
  setLayout(world.layout)
  resetRegistries()
  critters.length = 0
  const tick = () => new Promise((r) => setTimeout(r, 0))
  progress("地面を描いています…")
  await tick()
  lap("scene: start")
  initWalk()
  const renderer = createSceneRenderer(resources)
  const shadows = new SceneShadowUpdates({ shadowMap: renderer.shadowMap })
  const scene = createSceneRoot(resources)

  const post = resources.use(new DioramaPostProcessing(renderer))
  const render = () => post.render({ scene: scene, cam: cam, diorama: diorama, renderScale: camera.scale })

  const groundCanvasSource = await createSceneTerrain({ scene: scene, world: world, ground: ground, progress: progress, tick: tick, resources: resources }),
    groundCanvas = groundCanvasSource.groundCanvas,
    wm = groundCanvasSource.wm,
    terrain = groundCanvasSource.terrain
  const town = new THREE.Group()
  scene.add(town)
  world.build(town)
  lap("scene: town built")
  // still things that share a material become one draw each; a house, a stall or a swaying crown
  // keeps its own transform so it can still fade, hide or move as one
  if (!world.indoor) {
    const anchors = [...occluders.map((o) => o.obj), ...Object.values(stalls).flatMap((s) => [s.wares, s.cover, s.group ?? s.wares])]
    const merged = mergeStatic(town, { anchors, moving: movingObjects })
    lap(`scene: merged ${merged.before} meshes into ${merged.after}`)
  }
  spawnAnimals(scene, map)

  const environment = createEnvironment(scene, resources)
  const peopleSource = await createPopulation({ scene: scene, map: map, world: world, progress: progress, tick: tick, own: (person) => resources.use(person.fig) }),
    people = peopleSource.people,
    ids = peopleSource.ids,
    personOf = peopleSource.personOf,
    applySchedule = peopleSource.applySchedule
  const walkers = new SceneWalkers({ scene, onPickPlayer: (id) => runtime.events?.pickPlayer?.(id), figureScale: world.figureMetres === undefined ? 1 : world.figureMetres / FIG })
  resources.use(walkers)
  const meSource = walkers,
    me = meSource.me,
    movement = meSource.movement,
    remotes = meSource.remotes,
    setAvatar = meSource.setAvatar,
    addRemote = meSource.addRemote,
    updateRemote = meSource.updateRemote,
    removeRemote = meSource.removeRemote,
    clearRemotes = meSource.clearRemotes,
    moveRemote = meSource.moveRemote,
    plate = meSource.plate
  // warps: a soft ring of light on the ground
  const warps = resources.use(new WarpMarkers(scene))

  // destination marker and a cursor on the cell under the pointer
  const markers = createWalkMarkers(scene)
  const marker = markers.marker
  const cursor = markers.cursor

  // the view looks at the player; the preview looks wherever it is sent, and can pull further back
  if (preview) {
    me.fig.root.visible = false
    movement.yaw = movement.yawTarget = movement.yaw + keyTurn(options.turn ?? 0)
  }
  const lookAt = options.at ?? world.middle ?? world.centre
  const start = preview ? new THREE.Vector3(lookAt[0], walkH(lookAt[0], lookAt[1]), lookAt[1]) : new THREE.Vector3(me.pos[0], walkH(me.pos[0], me.pos[1]), me.pos[1])
  const camera = createSceneCamera({ viewport: { renderer, post }, position: start, preview, zoom: options.zoom })
  const cam = camera.camera,
    camFocus = camera.focus
  const resize = camera.resize,
    zoom = camera.zoom
  const lighting = createLighting({ scene: scene, world: world, wm: wm, applySchedule: applySchedule, environment: environment })
  const setClock = (min: number) => {
    lighting.setClock(min)
    shadows.invalidate()
  }
  const setTod = (k: number) => {
    lighting.setTod(k)
    shadows.invalidate()
  }
  // ---------------------------------------------------------------- movement
  const action = new PendingAction<Actor>()
  const movementControl = new SceneMovement({ me, action, marker, focus: camFocus, movement, onWalk: (path) => runtime.events?.walk(path) })
  const freeze = movementControl.freeze
  const walkTo = movementControl.walkTo
  const placePlayer = movementControl.placePlayer
  const hold = movementControl.hold
  const stop = movementControl.stop
  // ---------------------------------------------------------------- gathering spots (core/gather.ts)
  const spotsSource = new SceneGathering({ town, map }),
    setNodes = spotsSource.setNodes,
    spotHit = spotsSource.spotHit
  const interactions = new SceneInteractions({
    me,
    action,
    movement: movementControl,
    spots: spotsSource.spots,
    personOf,
    reach,
    marker,
    stationAt: (id) => runtime.events?.stationAt(id),
    gatherAt: (id) => runtime.events?.gatherAt(id),
  })
  const approachSpot = interactions.approachSpot
  const approach = interactions.approach
  const posture = new ScenePosture({ walkers, freeze, endFight: () => action.endFight() })
  const playAction = posture.playAction
  const setDown = posture.setDown
  const setSitting = posture.setSitting

  // ---------------------------------------------------------------- creatures (core/monsters.ts)
  const monsters = makeMonsters(town, map)
  const combat = new SceneCombat({
    monsters,
    me,
    action,
    movement: movementControl,
    onWalk: (path) => runtime.events?.walk(path),
    playSwing: (until) => {
      walkers.action = { anim: "sword", until }
    },
    onSwing: (id) => runtime.events?.swing(id),
  })
  const fight = combat.fight
  const monsterHit = (ray: THREE.Raycaster): string | null => pickVisibleOwner({ ray, owners: monsters, root: (monster) => monster.body })?.spawn.id ?? null
  const labelProjection = new SceneLabelProjection({ camera: cam, viewport: camera })
  const hitLabels = resources.use(new SceneHitLabels({ plate, place: labelProjection.place }))
  const feedback = new SceneCombatFeedback({
    monsters,
    me,
    remotes,
    labels: hitLabels,
    defeated: (monster) => {
      burst(monster, town, Date.now())
      action.endFight(monster.spawn.id)
    },
  })
  const setWild = feedback.setWild
  const struck = feedback.struck
  const hurt = feedback.hurt

  function reach(a: Actor) {
    marker.visible = false
    faceResident(ids[people.indexOf(a)])
    runtime.events?.reach(ids[people.indexOf(a)])
  }
  function faceResident(id: number) {
    const a = personOf(id)
    if (!a) return
    a.faceTo(me.pos)
    me.head = Math.atan2(a.pos[0] - me.pos[0], a.pos[1] - me.pos[1])
  }

  const previewControls = preview ? createPreviewControls({ renderer, movement, pan: (dx, dy, yaw) => camera.pan(dx, dy, yaw), zoom }) : null
  const pointer = preview
    ? { update() {}, dispose() {}, hovered: null, hoveredWalker: null, hoveredMonster: null, hoveredCritter: null }
    : new ScenePointer({
        renderer,
        cam,
        terrain,
        town,
        people,
        ids,
        remotes,
        cursor,
        movement,
        spotHit,
        monsterHit,
        approach,
        approachSpot,
        fight,
        walkTo,
        zoom,
        clearFight: () => {
          action.endFight()
        },
      })
  resources.use(pointer)
  if (previewControls) resources.use(previewControls)
  /** Release all construction resources together when the map is left. */
  function dispose() {
    resources.dispose()
  }

  // ---------------------------------------------------------------- names (DOM over the canvas)
  const residentNames = new SceneResidentNames({
    people,
    me,
    create: createResidentNameplate,
    place: (person, element, visible) =>
      labelProjection.place({
        element,
        visible,
        pos: [person.fig.root.position.x, person.fig.root.position.z],
        height: person.fig.height,
        ground: person.fig.root.position.y,
        offset: 2,
      }),
  })
  const speech = new SceneSpeech({
    me,
    remotes,
    create: (text) => plate("gx-bubble", text),
    place: (walker, element) => labelProjection.place({ element, pos: walker.pos, height: walker.fig.height, ground: walker.fig.root.position.y, offset: 20 }),
  })
  const bubble = speech.bubble
  function setLayer(el: HTMLElement) {
    walkers.layer = el
    for (const node of [me.label, ...residentNames.elements, ...monsters.map((m) => m.label), ...[...remotes.values()].map((w) => w.label), ...speech.elements]) el.appendChild(node)
  }
  const clock = new THREE.Clock()
  const worldAnimation = new SceneWorldAnimation({ camera: cam, movement, people, animate: lighting.animate })
  const cameraFollow = new SceneCameraFollow({ camera, movement, me, preview: previewControls, heightAt: walkH })
  const occlusion = new SceneOcclusion({ occluders, camera: cam, me, preview })
  const frameLoop = new SceneFrameLoop({ clock, running: () => runtime.running, render: (frame) => frameRenderer.render(frame), tick: () => runtime.events?.tick() })
  const outlines = new SceneOutlines({ me, people, remotes, monsters, critters, pointer, preview })

  // ash: settled on everything that faces the sky outdoors, and falling round the player
  const ashfall = world.indoor ? null : new Ashfall()
  if (!world.indoor) {
    dustAll(scene, (o) => o === terrain)
    scene.add(ashfall!.points)
  }

  const frameRenderer = new SceneFrameRenderer({
    world,
    scene,
    town,
    camera,
    walkers,
    preview,
    stepHeld: movementControl.stepHeld,
    arrive: interactions.arrive,
    marker,
    warps,
    animation: worldAnimation,
    cameraFollow,
    shadows,
    occlusion,
    pointer,
    outlines,
    smoke: environment.smoke,
    draw: render,
    projection: labelProjection,
    monsters,
    action,
    combat,
    residentNames,
    speech,
    ashfall,
    lighting,
    record: frameLoop.record,
  })

  const runtime = {
    renderer,
    people,
    ids,
    movement,
    groundCanvas,
    remotes,
    dispose,
    running: false,
    events: null as SceneEvents | null,
    heading: () => me.head,
    fps: () => frameLoop.fps,
    lights: () => ({ windows: houseGlows.length, lit: houseGlows.filter((g) => g.mat.emissiveIntensity > 0).length, lamps: lamps.length, lampsOn: lamps.filter((l) => l.light.intensity > 0).length }),
    resize,
    zoom,
    zoomLevel: camera.zoomLevel,
    setTod,
    setClock,
    setNodes,
    playAction,
    setWild,
    struck,
    hurt,
    setDown,
    setSitting,
    fight,
    setAttackDelay: combat.setAttackDelay,
    approach,
    stop,
    stopFight(id: string) {
      if (action.fighting === id) stop()
    },
    placePlayer,
    faceResident,
    setLayer,
    setAvatar,
    bubble,
    freeze,
    setWarps: (cells: readonly (readonly [number, number])[]) => warps.set(cells),
    addRemote,
    updateRemote,
    removeRemote,
    moveRemote,
    clearRemotes,
    walkTo: (t: V2) => {
      walkTo(t)
    },
    hold,
    start: frameLoop.start,
  }
  return runtime
}

export { createSceneRuntime }
