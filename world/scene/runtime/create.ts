import type { SceneFrame } from "#/world/scene/runtime/scene-frame-types"
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
import { createPointer } from "#/world/scene/runtime/pointer"
import { createPreviewControls } from "#/world/scene/runtime/preview"
import { createWalkers } from "#/world/scene/runtime/walkers"
import { DioramaPostProcessing } from "#/lib/graphics/post-processing"
import { mergeStatic } from "#/lib/graphics/merge-static"
import * as THREE from "three"
import { initWalk } from "#/world/scene/init-walk"
import { walkH } from "#/world/scene/walk-h"
import { setLayout } from "#/world/scene/set-layout"
import { updateCutaways } from "#/world/scene/update-cutaways"
import { burst } from "#/world/scene/burst"
import { makeMonsters } from "#/world/scene/make-monsters"
import { SceneCombat } from "#/world/scene/runtime/scene-combat"
import { updateMonsterHealth } from "#/world/scene/update-monster-health"
import { updateMonsters } from "#/world/scene/update-monsters"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { groundOf } from "#/world/scene/ground-of"
import { updaters, occluders, houseGlows, lamps, stalls, movingObjects } from "#/world/scene/construction/registry"
import { resetRegistries } from "#/world/scene/construction/reset-registries"
import type { V2 } from "#/world/scene/construction/registry"
import { daylight } from "#/world/core/daylight"
import type { Anim } from "#/world/scene/figure/animation"
import { outlineShape } from "#/lib/graphics/outline-shape"
import type { Actor } from "#/world/scene/actor"
import { view } from "#/world/scene/actors"
import { FIG } from "#/world/scene/figure/display-scale"
import { critters } from "#/world/scene/critters"
import { spawnAnimals } from "#/world/scene/spawn-animals"
import { tickSprites } from "#/world/scene/tick-sprites"
import { lap } from "#/world/lap"
import { Ashfall } from "#/world/scene/ashfall"
import { dustAll } from "#/world/scene/dust-all"
import { MAP_SCENES } from "#/world/scene/runtime/definitions"
import { diorama } from "#/world/scene/runtime/settings"
import { createTerrain } from "#/world/scene/runtime/terrain"
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
  let shadowDirty = true
  const scene = createSceneRoot(resources)

  const post = resources.use(new DioramaPostProcessing(renderer))
  const render = () => post.render({ scene: scene, cam: cam, diorama: diorama, renderScale: camera.scale })

  const groundCanvasSource = await createTerrain({ scene: scene, world: world, ground: ground, progress: progress, tick: tick, resources: resources }),
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
  const walkers = createWalkers(scene, (id) => runtime.events?.pickPlayer?.(id), world.figureMetres === undefined ? 1 : world.figureMetres / FIG)
  resources.defer(() => walkers.clearRemotes())
  resources.use(walkers.me.fig)
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
    stepWalker = meSource.stepWalker,
    placeWalker = meSource.placeWalker,
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
    shadowDirty = true
  }
  const setTod = (k: number) => {
    lighting.setTod(k)
    shadowDirty = true
  }
  // ---------------------------------------------------------------- movement
  const action = new PendingAction<Actor>()
  const movementControl = new SceneMovement({ me, action, marker, focus: camFocus, movement, onWalk: (path) => runtime.events?.walk(path) })
  const freeze = movementControl.freeze
  const walkTo = movementControl.walkTo
  const placePlayer = movementControl.placePlayer
  const hold = movementControl.hold
  const stepHeld = movementControl.stepHeld
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
  /** Play an action for a moment, facing the spot. */
  function playAction(anim: Anim, cell: readonly [number, number]) {
    const at: V2 = [(cell[0] + 0.5) / 2, (cell[1] + 0.5) / 2]
    me.head = Math.atan2(at[0] - me.pos[0], at[1] - me.pos[1])
    me.fig.face(me.head)
    walkers.action = { anim, until: performance.now() + 1400 }
  }

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
  const monsterHit = (ray: THREE.Raycaster): string | null => {
    const hits = ray.intersectObjects(
      monsters.filter((m) => m.body.visible).map((m) => m.body),
      true,
    )
    let o: THREE.Object3D | null = hits[0]?.object ?? null
    while (o && !o.userData.monster) o = o.parent
    return (o?.userData.monster as string | undefined) ?? null
  }
  function setWild(states: Readonly<Record<string, { hp: number; back: number }>>) {
    for (const m of monsters) {
      const s = states[m.spawn.id]
      if (s) {
        m.hp = s.hp
        m.back = s.back
      }
    }
  }
  function struck(inputProps: { id: string; kind: "miss" | "hit" | "critical"; damage: number; hp: number; back: number }) {
    const id = inputProps.id
    const kind = inputProps.kind
    const damage = inputProps.damage
    const hp = inputProps.hp
    const back = inputProps.back

    const m = monsters.find((x) => x.spawn.id === id)
    if (!m) return
    if (hp >= 0) m.hp = hp
    if (back) m.back = back
    if (hp === 0) {
      burst(m, town, Date.now())
      action.endFight(id)
    }
    // the number floats up from where it was struck
    const el = document.createElement("div")
    el.className = `gx-hit gx-hit--${kind}`
    el.textContent = kind === "miss" ? "ミス" : String(damage)
    walkers.layer?.appendChild(el)
    labelProjection.place({ element: el, pos: m.pos, height: 0.5 })
    setTimeout(() => el.remove(), 900)
  }

  function hurt(who: string, kind: "miss" | "hit" | "critical", damage: number) {
    const w = who === "me" ? me : remotes.get(who)
    if (!w) return
    const el = document.createElement("div")
    el.className = `gx-hit gx-hit--${kind === "miss" ? "miss" : "taken"}`
    el.textContent = kind === "miss" ? "かわした" : String(damage)
    walkers.layer?.appendChild(el)
    labelProjection.place({ element: el, pos: w.pos, height: w.fig.height * 0.9 })
    setTimeout(() => el.remove(), 900)
  }
  let down = false
  function setDown(on: boolean) {
    if (on === down) return
    down = on
    freeze(on)
    if (on) {
      action.endFight()
      walkers.action = { anim: "sit", until: Infinity }
    } else walkers.action = null
  }

  let sitting = false
  function setSitting(on: boolean) {
    if (on === sitting || down) return
    sitting = on
    walkers.action = on ? { anim: "sit", until: Infinity } : null
  }

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
    : createPointer({
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
  const labelProjection = new SceneLabelProjection({ camera: cam, viewport: camera })

  const clock = new THREE.Clock()
  const v = new THREE.Vector3()
  const camRight = new THREE.Vector3()
  const projection = new THREE.Matrix4()
  const followPosition = new THREE.Vector3()
  const occlusion = new SceneOcclusion({ occluders, camera: cam, me, preview })
  const frameLoop = new SceneFrameLoop({ clock, running: () => runtime.running, render: frame, tick: () => runtime.events?.tick() })
  const SHADOW_MS = 250
  let shadowAt = 0
  function frame(input: SceneFrame) {
    const at = input.at
    if (shadowDirty || at - shadowAt > SHADOW_MS) {
      renderer.shadowMap.needsUpdate = true
      shadowDirty = false
      shadowAt = at
    }
    const elapsed = input.elapsed
    const dt = input.dt
    const t = input.time
    if (!preview) stepHeld()
    const wasWalking = me.path.length > 0
    stepWalker(me, dt, elapsed)
    if (wasWalking && !me.path.length) interactions.arrive()
    // A path requested by held input starts now; it must not consume time from the previous frame.
    stepHeld()
    placeWalker(me)
    for (const w of remotes.values()) {
      stepWalker(w, dt, elapsed)
      placeWalker(w)
    }
    marker.scale.setScalar(1 + Math.sin(t * 6) * 0.1)
    warps.update(t)

    tickSprites()
    view.yaw = movement.yaw
    view.cam.copy(cam.position)
    view.frustum.setFromProjectionMatrix(projection.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse))
    // residents stand and look around; they speak only through the conversation window
    people.forEach((p) => p.update(dt, t, () => {}))
    cam.getWorldDirection(v)
    camRight.set(-v.z, 0, v.x).normalize()
    critters.forEach((c) => c.update(dt, camRight))
    updaters.forEach((u) => u(t, dt))
    lighting.animate(dt, t)

    // camera
    // a still middle: the view holds while the player moves about the middle of the screen
    // (DEAD of its width and height), follows by as much as they step beyond it, and comes back to
    // centre them after a turn of the view
    if (previewControls) {
      movement.yaw = movement.yawTarget
      previewControls.update(dt, camera.height)
      camFocus.y = walkH(camFocus.x, camFocus.z) + 0.6
      camera.look(camFocus, movement.yaw)
    } else {
      camera.update({ meAt: followPosition.set(me.pos[0], me.fig.root.position.y + 0.6, me.pos[1]), yaw: movement.yawTarget, turned: movement.yaw !== movement.yawTarget, dt: dt })
      movement.yaw = movement.yawTarget
    }

    if (world.indoor) updateCutaways(cam.position)
    // a field's fog is measured from the player, not the camera, so it thickens beyond them, never on them
    const fogDef = world.layout.fog
    if (fogDef && scene.fog instanceof THREE.Fog) {
      scene.fog.near = camera.distance + fogDef.near
      scene.fog.far = camera.distance + fogDef.far
    }
    const hidden = occlusion.update(dt)
    pointer.update()
    if (!preview) {
      me.fig.xray(hidden)
      // the player is always outlined (seen through roofs too); anyone else while the pointer is on them
      me.fig.outline(true, hidden)
    }
    for (const a of people) a.fig.outline(a === pointer.hovered)
    for (const w of remotes.values()) w.fig.outline(w === pointer.hoveredWalker)
    for (const m of monsters) outlineShape(m.body, m.spawn.id === pointer.hoveredMonster)
    for (const c of critters) c.outline(c === pointer.hoveredCritter)
    environment.smoke.prepare(cam)
    render()

    // names over heads: players always, residents when near or under the pointer
    for (const w of [me, ...remotes.values()]) labelProjection.place({ element: w.label, pos: w.pos, height: w.fig.height, ground: w.fig.root.position.y, offset: 2 })
    // creatures: where the clock puts them; the one we fight, followed and struck when in reach
    const wall = Date.now()
    updateMonsters({ list: monsters, root: town, now: wall, yaw: movement.yaw, dt: dt })
    for (const m of monsters) {
      const kind = MONSTER_KINDS[m.spawn.kind]
      const show = m.body.visible && (m.spawn.id === action.fighting || m.hp < kind.hp || Math.hypot(m.pos[0] - me.pos[0], m.pos[1] - me.pos[1]) < 4)
      updateMonsterHealth(m)
      labelProjection.place({ element: m.label, visible: show, pos: m.pos, height: 0.55, ground: m.groundHeight, offset: 2 })
    }
    combat.update(wall)
    residentNames.update(pointer.hovered)
    const now = performance.now()
    speech.update(now)
    ashfall?.update({ dt: dt, t: t, focus: camFocus, night: 1 - daylight(lighting.minutes) })
    frameLoop.record(now)
  }

  // ash: settled on everything that faces the sky outdoors, and falling round the player
  const ashfall = world.indoor ? null : new Ashfall()
  if (!world.indoor) {
    dustAll(scene, (o) => o === terrain)
    scene.add(ashfall!.points)
  }

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
