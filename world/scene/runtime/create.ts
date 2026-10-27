import { PendingAction } from "./action-target"
import { WarpMarkers } from "./warps"
import { FrameLimiter } from "../../../lib/engine/frame-limiter"
import { walkDirection } from "../turn"
import { createGatheringSpots } from "./gathering.ts"
import { createPointer } from "./pointer.ts"
import { PixelCamera } from "../../../lib/graphics/pixel-camera.ts"
import { createWalkers } from "./walkers.ts"
import { DioramaPostProcessing } from "../../../lib/graphics/post-processing.ts"
import { mergeStatic } from "../../../lib/graphics/batch.ts"
import * as THREE from "three"
import { initWalk, walkH, isFree, setLayout } from "../world"
import { updateCutaways } from "../interior"
import { REACH } from "../../core/gather.ts"
import { burst, makeMonsters, standBy, updateMonsterHealth, updateMonsters } from "../monsters"
import { MELEE_REACH, MONSTER_KINDS } from "../../core/monsters.ts"
import { groundOf } from "../ground"
import { updaters, occluders, resetRegistries, houseGlows, lamps, stalls, movingObjects, type V2 } from "../build"
import { daylight } from "../../core/clock.ts"
import type { Anim } from "../figure"
import { outlineShape } from "../outline"
import { type Actor, critters, spawnAnimals, view, FIG_PPU } from "../actors"
import { tickSprites } from "../sprite-pool"
import { exposeScene, lap } from "../../diagnostics.ts"
import { Ashfall, dustAll } from "../ash"
import { findPath } from "../path"
import { MAP_SCENES } from "./definitions.ts"
import { diorama } from "./settings.ts"
import { createTerrain } from "./terrain.ts"
import { createEnvironment, createLighting } from "./lighting.ts"
import { createPopulation } from "./population.ts"
import type { Cell, SceneEvents } from "./types.ts"
import type { Walker } from "./walker.ts"
import { center, CELL, cellOf, NAME_RANGE } from "./grid.ts"

async function createSceneRuntime(map: string, progress: (t: string) => void) {
  const world = MAP_SCENES[map] ?? MAP_SCENES.phanthiet
  progress("地面を描いています…")
  // the ground and the plan's fields come from workers or from an earlier visit; only then is the plan used
  const ground = await groundOf(map)
  lap("scene: ground painted")
  setLayout(world.layout)
  resetRegistries()
  critters.length = 0
  const tick = () => new Promise((r) => setTimeout(r, 0))
  progress("地面を描いています…")
  await tick()
  lap("scene: start")
  initWalk()
  const renderer = new THREE.WebGLRenderer({ antialias: false })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.BasicShadowMap
  // shadows are redrawn a few times a second and when the sun moves (frame()), not every frame
  renderer.shadowMap.autoUpdate = false
  let shadowDirty = true
  renderer.outputColorSpace = THREE.SRGBColorSpace
  Object.assign(renderer.domElement.style, { display: "block", imageRendering: "pixelated", touchAction: "none" })
  const scene = new THREE.Scene()
  exposeScene(scene)

  const post = new DioramaPostProcessing(renderer)
  const render = () => post.render(scene, cam, diorama, camera.scale)

  const { groundCanvas, wm, terrain } = await createTerrain(scene, world, ground, progress, tick)
  const town = new THREE.Group()
  world.build(town)
  lap("scene: town built")
  // still things that share a material become one draw each; a house, a stall or a swaying crown
  // keeps its own transform so it can still fade, hide or move as one
  if (!world.indoor) {
    const anchors = [...occluders.map((o) => o.obj), ...Object.values(stalls).flatMap((s) => [s.wares, s.cover, s.group ?? s.wares])]
    const merged = mergeStatic(town, { anchors, moving: movingObjects })
    lap(`scene: merged ${merged.before} meshes into ${merged.after}`)
  }
  scene.add(town)
  if (world.animals) spawnAnimals(scene)

  const environment = createEnvironment(scene)
  const { people, ids, personOf, applySchedule } = await createPopulation(scene, map, world, progress, tick)
  const walkers = createWalkers(scene, (id) => runtime.events?.pickPlayer?.(id))
  const { me, movement, remotes, setAvatar, addRemote, updateRemote, removeRemote, clearRemotes, moveRemote, stepWalker, placeWalker, plate } = walkers
  // warps: a soft ring of light on the ground
  const warps = new WarpMarkers(scene)

  // destination marker and a cursor on the cell under the pointer
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.24, 16), new THREE.MeshBasicMaterial({ color: 0xffe080, transparent: true, opacity: 0.85, depthTest: false }))
  marker.rotation.x = -Math.PI / 2
  marker.visible = false
  const cursorGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(CELL * 0.92, CELL * 0.92).rotateX(-Math.PI / 2))
  const cursor = new THREE.LineSegments(cursorGeo, new THREE.LineBasicMaterial({ color: 0xfff4d0, transparent: true, opacity: 0.7, depthTest: false }))
  cursor.visible = false
  // drawn last, over the houses, so they show where the street behind a house is clicked
  marker.renderOrder = cursor.renderOrder = 999
  scene.add(marker, cursor)

  const camera = new PixelCamera(new THREE.Vector3(me.pos[0], walkH(me.pos[0], me.pos[1]), me.pos[1]), FIG_PPU, (width, height, scale) => {
    const renderWidth = Math.ceil(width / scale),
      renderHeight = Math.ceil(height / scale)
    renderer.setPixelRatio(1)
    renderer.setSize(renderWidth, renderHeight, false)
    post.resize(renderWidth, renderHeight)
    renderer.domElement.style.width = width + "px"
    renderer.domElement.style.height = height + "px"
  })
  const cam = camera.camera,
    camFocus = camera.focus
  const resize = camera.resize,
    zoom = camera.zoom
  const lighting = createLighting(scene, world, wm, applySchedule, environment)
  const setClock = (min: number) => {
    lighting.setClock(min)
    shadowDirty = true
  }
  const setTod = (k: number) => {
    lighting.setTod(k)
    shadowDirty = true
  }
  // ---------------------------------------------------------------- movement
  let frozen = false
  const action = new PendingAction<Actor>()
  function freeze(on: boolean) {
    frozen = on
    if (on) {
      action.clear()
      if (me.path.length > 1) {
        me.path = [me.path[0]]
        runtime.events?.walk([cellOf(me.path[0])])
      }
      marker.visible = false
    }
  }
  function walkTo(t: V2, keepAction = false) {
    if (frozen) return false
    if (!keepAction) action.clear()
    const from = me.path.length ? me.path[0] : me.pos
    const p = findPath(from, t, true)
    if (!p) return false
    me.path = me.path.length ? [me.path[0], ...p.slice(1)] : p.slice(1)
    const end = p[p.length - 1]
    marker.position.set(end[0], walkH(end[0], end[1]) + 0.04, end[1])
    marker.visible = me.path.length > 0
    if (me.path.length) runtime.events?.walk([cellOf(from), ...p.slice(1).map(cellOf)])
    return true
  }
  function placePlayer(at: Cell) {
    const p = center(at)
    if (!isFree(p[0], p[1])) return
    action.clear()
    me.pos = p
    me.path = []
    camFocus.set(p[0], walkH(p[0], p[1]) + 0.6, p[1])
  }
  /** a direction held on the keys, on screen: right +x, up +y */
  let held: [number, number] | null = null
  function hold(dir: [number, number] | null) {
    held = dir && (dir[0] || dir[1]) ? dir : null
  }
  /** One cell on along the held keys, turned by the camera: up on screen is away from the camera. */
  function stepHeld() {
    if (!held || frozen || me.path.length > 1) return
    const [di, dj] = walkDirection(held, movement.yaw)
    const [ci, cj] = cellOf(me.path.length ? me.path[0] : me.pos)
    // straight on if it is free; on a slant blocked by a corner, slide along whichever side is open
    const tries: [number, number][] =
      di && dj
        ? [
            [di, dj],
            [di, 0],
            [0, dj],
          ]
        : [[di, dj]]
    for (const [a, b] of tries) {
      const next = center([ci + a, cj + b])
      if (!isFree(next[0], next[1])) continue
      walkTo(next)
      return
    }
  }
  function stop() {
    action.clear()
    if (me.path.length > 1) {
      me.path = [me.path[0]]
      runtime.events?.walk([cellOf(me.path[0])])
    }
    marker.visible = false
  }
  // ---------------------------------------------------------------- gathering spots (core/gather.ts)
  const { spots, setNodes, spotHit } = createGatheringSpots(town, map)
  /** Walk up to a gathering spot, then have a go at it. */
  function approachSpot(id: string) {
    const s = spots.get(id)
    if (!s || frozen) return
    action.clear()
    const within = (p: V2) => Math.hypot(p[0] - s.at[0], p[1] - s.at[1]) <= (REACH - 0.6) / 2
    const arrive = (x: string) => (x.startsWith("station:") ? runtime.events?.stationAt(x.slice(8)) : runtime.events?.gatherAt(x))
    if (within(me.pos)) {
      arrive(id)
      return
    }
    for (const r of [0.8, 1.1])
      for (let k = 0; k < 8; k++) {
        const ang = Math.atan2(me.pos[1] - s.at[1], me.pos[0] - s.at[0]) + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 4)
        const c: V2 = [s.at[0] + Math.cos(ang) * r, s.at[1] + Math.sin(ang) * r]
        if (isFree(c[0], c[1]) && walkTo(c)) {
          action.select({ kind: "spot", id })
          if (!me.path.length) {
            action.clear()
            arrive(id)
          }
          return
        }
      }
  }
  /** Play an action for a moment, facing the spot. */
  function playAction(anim: Anim, cell: readonly [number, number]) {
    const at: V2 = [(cell[0] + 0.5) / 2, (cell[1] + 0.5) / 2]
    me.head = Math.atan2(at[0] - me.pos[0], at[1] - me.pos[1])
    me.fig.face(me.head)
    walkers.action = { anim, until: performance.now() + 1400 }
  }

  // ---------------------------------------------------------------- creatures (core/monsters.ts)
  const monsters = makeMonsters(town, map)
  let attackDelay = 1500,
    lastSwing = 0,
    lastRepath = 0
  const monsterHit = (ray: THREE.Raycaster): string | null => {
    const hits = ray.intersectObjects(
      monsters.filter((m) => m.body.visible).map((m) => m.body),
      true,
    )
    let o: THREE.Object3D | null = hits[0]?.object ?? null
    while (o && !o.userData.monster) o = o.parent
    return (o?.userData.monster as string | undefined) ?? null
  }
  function fight(id: string) {
    if (!frozen) {
      action.clear()
      action.select({ kind: "fight", id })
      lastRepath = 0
    }
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
  function struck(id: string, kind: "miss" | "hit" | "critical", damage: number, hp: number, back: number) {
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
    const v = new THREE.Vector3()
    place(el, toScreen(m.pos, 0.5, v), v, 0)
    setTimeout(() => el.remove(), 900)
  }

  function hurt(who: string, kind: "miss" | "hit" | "critical", damage: number) {
    const w = who === "me" ? me : remotes.get(who)
    if (!w) return
    const el = document.createElement("div")
    el.className = `gx-hit gx-hit--${kind === "miss" ? "miss" : "taken"}`
    el.textContent = kind === "miss" ? "かわした" : String(damage)
    walkers.layer?.appendChild(el)
    const v = new THREE.Vector3()
    place(el, toScreen(w.pos, w.fig.height * 0.9, v), v, 0)
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

  function approach(id: number) {
    if (frozen) return
    const a = personOf(id)
    if (!a) return
    action.clear()
    action.select({ kind: "talk", resident: a })
    // stand on a free cell next to the resident, on the side facing the player
    const dx = me.pos[0] - a.pos[0],
      dz = me.pos[1] - a.pos[1],
      d = Math.hypot(dx, dz) || 1
    if (Math.hypot(dx, dz) < 1.6) {
      action.arrive()
      reach(a)
      return
    }
    // the nearest reachable free cell around them, preferring the side the player comes from
    for (const r of [0.9, 1.3, 1.8, 2.4])
      for (let k = 0; k < 8; k++) {
        const ang = Math.atan2(dz / d, dx / d) + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 4)
        const c: V2 = [a.pos[0] + Math.cos(ang) * r, a.pos[1] + Math.sin(ang) * r]
        if (isFree(c[0], c[1]) && walkTo(c, true)) {
          if (!me.path.length) {
            action.arrive()
            reach(a)
          }
          return
        }
      }
    action.arrive()
    reach(a)
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

  const pointer = createPointer({
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
  /** Let go of the window listeners and the GPU resources when the map is left. */
  function dispose() {
    pointer.dispose()
    warps.dispose()
    clearRemotes()
    me.fig.dispose()
    for (const person of people) person.fig.dispose()
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      for (const mm of mats) {
        ;(mm as THREE.MeshBasicMaterial).map?.dispose()
        mm.dispose()
      }
    })
    environment.dispose()
    post.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  // ---------------------------------------------------------------- names (DOM over the canvas)
  const residentLabels = people.map((a) => {
    const el = document.createElement("div")
    el.className = "gx-nameplate gx-nameplate--npc"
    el.textContent = a.name
    return el
  })
  const speech = new Map<Walker, { el: HTMLDivElement; until: number }>()
  function bubble(who: string, text: string) {
    const w = who === "me" ? me : remotes.get(who)
    if (!w) return
    speech.get(w)?.el.remove()
    speech.set(w, { el: plate("gx-bubble", text), until: performance.now() + Math.min(8000, 4000 + text.length * 80) })
  }
  function setLayer(el: HTMLElement) {
    walkers.layer = el
    for (const node of [me.label, ...residentLabels, ...monsters.map((m) => m.label), ...[...remotes.values()].map((w) => w.label), ...[...speech.values()].map((b) => b.el)]) el.appendChild(node)
  }
  const toScreen = (pos: V2, h: number, out: THREE.Vector3) => {
    out.set(pos[0], walkH(pos[0], pos[1]) + h, pos[1]).project(cam)
    return out.z < 1 && Math.abs(out.x) < 1.1 && Math.abs(out.y) < 1.1
  }
  const place = (el: HTMLElement, vis: boolean, p: THREE.Vector3, dy = 0) => {
    const display = vis ? "" : "none"
    if (el.style.display !== display) el.style.display = display
    if (vis) el.style.transform = `translate(${Math.round(((p.x + 1) / 2) * camera.width)}px, ${Math.round(((1 - p.y) / 2) * camera.height) - dy}px) translate(-50%, -100%)`
  }

  const clock = new THREE.Clock()
  const v = new THREE.Vector3()
  const camRight = new THREE.Vector3()
  const projection = new THREE.Matrix4()
  const followPosition = new THREE.Vector3()
  const head = new THREE.Vector3()
  const occlusionRay = new THREE.Ray()
  const hitPoint = new THREE.Vector3()
  let lastReport = 0
  let frames = 0,
    fpsAt = performance.now(),
    fpsNow = 0
  // Cap high-refresh displays while allowing smooth movement at 60 frames a second.
  const framesDue = new FrameLimiter(60)
  const SHADOW_MS = 250
  let shadowAt = 0
  function frame(at: number) {
    if (!runtime.running) return
    if (!framesDue.ready(at)) {
      requestAnimationFrame(frame)
      return
    }
    if (shadowDirty || at - shadowAt > SHADOW_MS) {
      renderer.shadowMap.needsUpdate = true
      shadowDirty = false
      shadowAt = at
    }
    const elapsed = clock.getDelta()
    const dt = Math.min(0.05, elapsed)
    const t = clock.elapsedTime
    const wasWalking = me.path.length > 0
    stepWalker(me, dt, elapsed)
    if (wasWalking && !me.path.length) {
      marker.visible = false
      const arrived = action.arrive()
      if (arrived?.kind === "talk") reach(arrived.resident)
      else if (arrived?.kind === "spot") {
        if (arrived.id.startsWith("station:")) runtime.events?.stationAt(arrived.id.slice(8))
        else runtime.events?.gatherAt(arrived.id)
      }
    }
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
    camera.update(followPosition.set(me.pos[0], walkH(me.pos[0], me.pos[1]) + 0.6, me.pos[1]), movement.yawTarget, movement.yaw !== movement.yawTarget, dt)
    movement.yaw = movement.yawTarget

    if (world.indoor) updateCutaways(cam.position)
    // a field's fog is measured from the player, not the camera, so it thickens beyond them, never on them
    const fogDef = world.layout.fog
    if (fogDef && scene.fog instanceof THREE.Fog) {
      scene.fog.near = camera.distance + fogDef.near
      scene.fog.far = camera.distance + fogDef.far
    }
    // fade houses and trees standing between the camera and the player
    head.set(me.pos[0], walkH(me.pos[0], me.pos[1]) + 0.9, me.pos[1])
    occlusionRay.set(cam.position, hitPoint.copy(head).sub(cam.position).normalize())
    const maxD = cam.position.distanceTo(head)
    let hidden = false
    occluders.forEach((o) => {
      const hit = occlusionRay.intersectBox(o.box, hitPoint) && hitPoint.distanceTo(cam.position) < maxD - 0.3
      if (o.opaque) {
        hidden ||= !!hit
        return
      }
      const want = hit ? o.min : 1
      if (o.fade === want) return
      o.fade += (want - o.fade) * Math.min(1, dt * 8)
      if (Math.abs(o.fade - want) < 0.01) o.fade = want
      o.obj.traverse((c) => {
        const mm = (c as THREE.Mesh).material as THREE.Material | undefined
        if (!mm) return
        mm.transparent = o.fade < 1
        mm.opacity = o.fade
        mm.depthWrite = o.fade >= 1
      })
      o.obj.visible = o.fade > 0.03
    })
    pointer.update()
    me.fig.xray(hidden)
    // the player is always outlined (seen through roofs too); anyone else while the pointer is on them
    me.fig.outline(true, hidden)
    for (const a of people) a.fig.outline(a === pointer.hovered)
    for (const w of remotes.values()) w.fig.outline(w === pointer.hoveredWalker)
    for (const m of monsters) outlineShape(m.body, m.spawn.id === pointer.hoveredMonster)
    for (const c of critters) c.outline(c === pointer.hoveredCritter)
    environment.smoke.prepare(cam)
    render()

    // names over heads: players always, residents when near or under the pointer
    for (const w of [me, ...remotes.values()]) place(w.label, toScreen(w.pos, w.fig.height, v), v, 2)
    // creatures: where the clock puts them; the one we fight, followed and struck when in reach
    const wall = Date.now()
    updateMonsters(monsters, town, wall, movement.yaw, dt)
    for (const m of monsters) {
      const kind = MONSTER_KINDS[m.spawn.kind]
      const show = m.body.visible && (m.spawn.id === action.fighting || m.hp < kind.hp || Math.hypot(m.pos[0] - me.pos[0], m.pos[1] - me.pos[1]) < 4)
      updateMonsterHealth(m)
      place(m.label, show && toScreen(m.pos, 0.55, v), v, 2)
    }
    const target = action.fighting ? monsters.find((m) => m.spawn.id === action.fighting) : undefined
    if (target && !target.body.visible) action.endFight()
    else if (target) {
      const d = Math.hypot(target.pos[0] - me.pos[0], target.pos[1] - me.pos[1])
      if (d > MELEE_REACH) {
        if (wall - lastRepath > 600) {
          lastRepath = wall
          const p = standBy(target, me.pos, MELEE_REACH)
          if (p) walkTo(p, true)
        }
      } else {
        if (me.path.length > 1) {
          me.path = [me.path[0]]
          runtime.events?.walk([cellOf(me.path[0])])
        }
        me.head = Math.atan2(target.pos[0] - me.pos[0], target.pos[1] - me.pos[1])
        me.fig.face(me.head)
        if (wall - lastSwing >= attackDelay) {
          lastSwing = wall
          walkers.action = { anim: "sword", until: performance.now() + 600 }
          runtime.events?.swing(target.spawn.id)
        }
      }
    }
    people.forEach((a, i) => {
      const near = Math.hypot(a.pos[0] - me.pos[0], a.pos[1] - me.pos[1]) < NAME_RANGE || a === pointer.hovered
      residentLabels[i].classList.toggle("gx-nameplate--hover", a === pointer.hovered)
      place(residentLabels[i], a.fig.root.visible && near && toScreen(a.pos, a.fig.height, v), v, 2)
    })
    const now = performance.now()
    // bubbles sit above the name
    for (const [w, b] of speech) {
      if (now > b.until || (w !== me && !remotes.has(w.id))) {
        b.el.remove()
        speech.delete(w)
        continue
      }
      place(b.el, toScreen(w.pos, w.fig.height, v), v, 20)
    }
    ashfall?.update(dt, t, camFocus, 1 - daylight(lighting.minutes))
    frames++
    if (now - fpsAt >= 1000) {
      fpsNow = (frames * 1000) / (now - fpsAt)
      frames = 0
      fpsAt = now
    }
    if (now - lastReport > 200) {
      lastReport = now
      runtime.events?.tick()
    }
    requestAnimationFrame(frame)
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
    fps: () => fpsNow,
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
    setAttackDelay: (ms: number) => {
      attackDelay = ms
    },
    approach,
    stop,
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
    start: () => {
      clock.getDelta()
      requestAnimationFrame(frame)
    },
  }
  return runtime
}

export { createSceneRuntime }
