import * as THREE from "three"
import { walkH, isFree } from "./world"
import { findPath } from "./path"
import { places, type V2, pigMesh, sheepMesh, addSprite } from "./build"
import { toTex } from "./gfx"
import { henFrames, catFrames, GPPU } from "./goods"
import { Rng } from "./pix"
import { outlineShape, outlineSprite } from "./outline"

import { FW, FH, OY, SPPU, FRAMES, ANIM_DUR, type Look, type Item, type Anim } from "./figure"
import { bakedStrip, lookKey, spriteFrame } from "./sprite-pool"
export type { Look, Item, Anim }

/**
 * Shared view state: camera yaw (for picking sprite directions), sprite tint (time of day), the
 * camera position and what it sees (to put sprites on screen first).
 */
export const view = { yaw: 0, tint: new THREE.Color(1, 1, 1), cam: new THREE.Vector3(), frustum: new THREE.Frustum() }
const tmpV = new THREE.Vector3()

/** One anim/item/view as a strip of frames that fills in as they arrive. */
interface Strip {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  tex: THREE.Texture
  ready: Uint8Array
  requested: Uint8Array
  count: number
  disposed?: boolean
  baked?: "loading" | "failed"
}

/** Strips baked ahead of time for a figure whose look never changes: anim and view → file URL. */
export type BakedStrips = { item: Item; url: (anim: Anim, view: number) => string | null }

// Keep two complete sets of eight directions per figure; older poses can be loaded again.
const MAX_STRIPS = 16

const shadowGeo = new THREE.CircleGeometry(0.26, 12)
// upright card with the feet anchor at the origin; standing vertical (not camera-facing)
// keeps it from leaning into walls behind or poking through awnings in front
/** villagers are drawn at this fraction of their modelled size so they sit right against the buildings */
export const FIG = SPPU / 67.5 // keeps 67.5 texels per world unit on screen (the zoom levels assume it)
export const FIG_PPU = SPPU / FIG // sprite texels per world unit as displayed
const cardGeo = new THREE.PlaneGeometry(FW / FIG_PPU, FH / FIG_PPU).translate(0, (FH / 2 - (FH - OY)) / FIG_PPU, 0)
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1a1420, transparent: true, opacity: 0.32, depthWrite: false })

/** Villager drawn as an 8-direction pixel sprite; strips are rendered on demand. */
export class Figure {
  root = new THREE.Group()
  sprite: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  item: Item = null
  heading = 0
  anim: Anim = "idle"
  t = 0
  height: number
  private disposed = false
  private strips = new Map<string, Strip>()
  private id: string
  /** a silhouette drawn through walls, while something we cannot see into stands in front */
  private ghost: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null
  xray(on: boolean) {
    if (!on && !this.ghost) return
    if (!this.ghost) {
      this.ghost = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ color: 0xdfe6ff, transparent: true, opacity: 0.42, depthTest: false, depthWrite: false, alphaTest: 0.2 }))
      this.ghost.renderOrder = 999
      this.sprite.add(this.ghost)
    }
    this.ghost.visible = on
    if (this.ghost.material.map !== this.sprite.material.map) {
      this.ghost.material.map = this.sprite.material.map
      this.ghost.material.needsUpdate = true
    }
  }
  /**
   * A white line one texel wide round the figure's outline: the player always has one, so they can
   * be found at a glance by night or behind a roof; anyone else only while the pointer is on them.
   */
  private rim: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null
  private rimTexel = { value: new THREE.Vector2(1 / FW, 1 / FH) }
  outline(on: boolean, through = false) {
    if (!on && !this.rim) return
    if (!this.rim) {
      const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, fog: false })
      const texel = this.rimTexel
      m.onBeforeCompile = (shader) => {
        shader.uniforms.rimTexel = texel
        shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec2 rimTexel;").replace(
          "#include <map_fragment>",
          `
            // white where this texel is empty and one beside it is not
            float self = texture2D(map, vMapUv).a;
            float side = max(max(texture2D(map, vMapUv + vec2(rimTexel.x, 0.0)).a, texture2D(map, vMapUv - vec2(rimTexel.x, 0.0)).a),
                             max(texture2D(map, vMapUv + vec2(0.0, rimTexel.y)).a, texture2D(map, vMapUv - vec2(0.0, rimTexel.y)).a));
            if (self > 0.5 || side < 0.5) discard;`,
        )
      }
      this.rim = new THREE.Mesh(cardGeo, m)
      this.rim.renderOrder = 998
      this.sprite.add(this.rim)
    }
    this.rim.visible = on && this.sprite.visible
    const m = this.rim.material
    if (m.depthTest === through) {
      m.depthTest = !through
      m.needsUpdate = true
    }
    this.syncRim()
  }
  private syncRim() {
    if (!this.rim) return
    const map = this.sprite.material.map
    if (this.rim.material.map !== map) {
      this.rim.material.map = map
      this.rim.material.needsUpdate = true
    }
    // the strip's frames sit side by side: one texel across is 1 / (frame width × frames) of the texture
    if (map) this.rimTexel.value.set(map.repeat.x / FW, 1 / FH)
  }
  constructor(
    public look: Look,
    private baked?: BakedStrips,
  ) {
    this.sprite = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ alphaTest: 0.5, color: view.tint }))
    this.sprite.position.y = 0.02
    this.sprite.visible = false
    const sh = new THREE.Mesh(shadowGeo, shadowMat)
    sh.rotation.x = -Math.PI / 2
    sh.position.y = 0.03
    sh.scale.set((look.age === "child" ? 0.75 : 1) * FIG, FIG, (look.age === "child" ? 0.6 : 0.8) * FIG)
    this.root.add(this.sprite, sh)
    this.height = (look.age === "child" ? 1.25 : 1.65) * FIG
    this.id = lookKey(look, null)
  }
  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.root.removeFromParent()
    for (const strip of this.strips.values()) {
      this.releaseStrip(strip)
    }
    this.strips.clear()
    this.sprite.material.dispose()
    this.ghost?.material.dispose()
    this.rim?.material.dispose()
  }
  private releaseStrip(strip: Strip) {
    strip.disposed = true
    strip.tex.dispose()
    strip.canvas.width = strip.canvas.height = 0
  }
  hold(it: Item) {
    this.item = it
  }
  /** Ask for the first frame of an anim from every side, so turning or rotating has something to show. */
  prefetch(anim: Anim, item: Item) {
    for (let v = 0; v < 8; v++) this.want(anim, item, v, 0, -500)
  }
  private strip(anim: Anim, item: Item, v: number): Strip {
    const key = anim + "|" + item + "|" + v
    let s = this.strips.get(key)
    if (s) {
      this.strips.delete(key)
      this.strips.set(key, s)
    } else {
      // Never release a texture still referenced by the visible figure or its overlays.
      for (const [oldKey, old] of this.strips) {
        if (this.strips.size < MAX_STRIPS) break
        if (old.tex === this.sprite.material.map || old.tex === this.ghost?.material.map || old.tex === this.rim?.material.map) continue
        this.strips.delete(oldKey)
        this.releaseStrip(old)
      }
      const count = FRAMES[anim]
      const canvas = document.createElement("canvas")
      canvas.width = count * FW
      canvas.height = FH
      const tex = new THREE.CanvasTexture(canvas)
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.NearestFilter
      tex.generateMipmaps = false
      tex.colorSpace = THREE.SRGBColorSpace
      tex.repeat.set(1 / count, 1)
      s = { canvas, ctx: canvas.getContext("2d")!, tex, ready: new Uint8Array(count), requested: new Uint8Array(count), count }
      this.strips.set(key, s)
    }
    return s
  }
  /** Request one frame; it is drawn into its strip when it arrives. */
  private want(anim: Anim, item: Item, v: number, f: number, urgency: number) {
    if (this.disposed) return
    const s = this.strip(anim, item, v)
    if (s.ready[f] || s.requested[f] || s.baked === "loading") return
    // a baked strip brings every frame at once
    const url = s.baked !== "failed" && this.baked?.item === item ? this.baked.url(anim, v) : null
    if (url) {
      const loaded = (strip: ImageBitmap | null) => {
        if (this.disposed || s.disposed) return
        if (!strip) {
          s.baked = "failed"
          return
        }
        s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height)
        s.ctx.drawImage(strip, 0, 0)
        s.ready.fill(1)
        s.tex.needsUpdate = true
      }
      const strip = bakedStrip(url, urgency, loaded)
      if (strip !== undefined) loaded(strip)
      else s.baked = "loading"
      if (s.baked !== "failed") return
    }
    s.requested[f] = 1
    const done = (frame: ImageBitmap) => {
      if (this.disposed || s.disposed || s.ready[f]) return
      s.ctx.clearRect(f * FW, 0, FW, FH)
      s.ctx.drawImage(frame, f * FW, 0)
      s.ready[f] = 1
      s.tex.needsUpdate = true
    }
    const data = spriteFrame(this.look, item, anim, v, f, urgency, done, this.id + "|" + item)
    if (data) done(data)
  }
  pose(anim: Anim, t: number) {
    this.anim = anim
    this.t = t
  }
  face(h: number) {
    this.heading = h
  }
  /** Pick the frame for the current camera angle; while it is still rendering show the closest one there is. */
  refresh() {
    if (this.disposed) return
    let rel = view.yaw - this.heading
    rel = ((rel % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const v = Math.round(rel / (Math.PI / 4)) % 8
    this.root.getWorldPosition(tmpV)
    const { x, y, z } = tmpV
    const dist = tmpV.distanceTo(view.cam)
    tmpV.y += this.height * 0.5
    const seen = view.frustum.containsPoint(tmpV)
    const s = this.strip(this.anim, this.item, v)
    const n = s.count
    const f = Math.floor(((((this.t / (Math.PI * 2)) % 1) + 1) % 1) * n) % n
    // on screen: this frame first, then the rest of the loop; off screen: just this frame, last
    if (seen) {
      this.want(this.anim, this.item, v, f, 400 - dist)
      for (let k = 1; k < n; k++) this.want(this.anim, this.item, v, (f + k) % n, 200 - dist - k)
    } else this.want(this.anim, this.item, v, f, -1000 - dist)
    let show: Strip | null = null,
      frame = f
    if (s.ready[f]) show = s
    else {
      for (let k = 1; k < n && !show; k++) {
        if (s.ready[(f + k) % n]) {
          show = s
          frame = (f + k) % n
        } else if (s.ready[(f - k + n) % n]) {
          show = s
          frame = (f - k + n) % n
        }
      }
      if (!show) {
        const idle = this.anim !== "idle" ? this.strip("idle", this.item, v) : null
        if (idle && seen) this.want("idle", this.item, v, 0, 300 - dist)
        const any = idle && idle.ready.indexOf(1) >= 0 ? idle : [...this.strips.values()].find((x) => x.ready.indexOf(1) >= 0)
        if (any) {
          show = any
          frame = any.ready.indexOf(1)
        }
      }
    }
    if (!show) {
      this.sprite.visible = false
      return
    }
    show.tex.offset.x = frame / show.count
    const m = this.sprite.material
    if (m.map !== show.tex) {
      m.map = show.tex
      m.needsUpdate = true
    }
    m.color.copy(view.tint)
    // face the camera around y only; stretch so the foreshortened card shows the sprite at full height
    tmpV.set(view.cam.x - x, view.cam.y - y, view.cam.z - z)
    const hd = Math.hypot(tmpV.x, tmpV.z) || 1
    this.sprite.rotation.y = Math.atan2(tmpV.x, tmpV.z) - this.root.rotation.y
    this.sprite.scale.y = Math.min(2.5, Math.hypot(hd, tmpV.y) / hd)
    this.sprite.position.set((tmpV.x / hd) * 0.12, 0.02, (tmpV.z / hd) * 0.12)
    this.sprite.visible = true
    this.syncRim()
  }
}

// ---------------------------------------------------------------- behaviours
export type Step = { go: string | V2; run?: boolean } | { do: Anim; t: number; face?: string | V2; item?: Item; say?: string[] } | { wander: [number, number, number, number]; n: number; anim?: Anim }

export class Actor {
  pos: V2
  path: V2[] = []
  heading = 0
  step = 0
  timer = 0
  anim: Anim = "idle"
  animT = 0
  speed: number
  fig: Figure
  wanderLeft = 0
  sayLines: string[] = []
  nextSay: number
  carry: Item = null
  constructor(
    public name: string,
    public job: string,
    look: Look,
    start: V2,
    public routine: Step[],
    public lines: string[],
    scene: THREE.Object3D,
    speed = 1.2,
    item: Item = null,
    baked?: BakedStrips,
  ) {
    this.fig = new Figure(look, baked)
    this.pos = [...start] as V2
    this.speed = speed
    scene.add(this.fig.root)
    this.fig.root.userData.actor = this
    this.fig.sprite.userData.actor = this
    this.fig.hold(item)
    this.carry = item
    // strips render lazily as each view is first needed (see pumpSprites)
    this.nextSay = 4 + Math.random() * 20
    this.place()
  }
  place() {
    this.fig.root.position.set(this.pos[0], walkH(this.pos[0], this.pos[1]), this.pos[1])
    this.fig.face(this.heading)
    this.fig.refresh()
  }
  goTo(t: V2) {
    const p = findPath(this.pos, t)
    this.path = p ? p.slice(1) : []
  }
  faceTo(t: V2) {
    this.heading = Math.atan2(t[0] - this.pos[0], t[1] - this.pos[1])
  }
  update(dt: number, time: number, say: (a: Actor, s: string) => void) {
    this.animT += dt * (this.anim === "walk" || this.anim === "carry" ? (9 * this.speed) / 1.2 : this.anim === "play" ? 12 : (Math.PI * 2) / ANIM_DUR[this.anim])
    if (this.path.length) {
      const [tx, tz] = this.path[0]
      const dx = tx - this.pos[0],
        dz = tz - this.pos[1],
        d = Math.hypot(dx, dz)
      const v = this.speed * dt
      if (d <= v) {
        this.pos = [tx, tz]
        this.path.shift()
      } else {
        this.pos[0] += (dx / d) * v
        this.pos[1] += (dz / d) * v
        const target = Math.atan2(dx, dz)
        let diff = target - this.heading
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        this.heading += diff * Math.min(1, dt * 10)
      }
      if (this.anim !== "carry" && this.anim !== "play") this.anim = "walk"
      if (!this.path.length) this.anim = "idle"
    } else if (this.routine.length) this.runRoutine(dt)
    this.fig.pose(this.anim, this.animT)
    if (this.fig.root.visible) this.place()
    this.nextSay -= dt
    if (this.nextSay < 0) {
      const pool = this.sayLines.length ? this.sayLines : this.lines
      // the callback may set its own pause
      this.nextSay = 10 + Math.random() * 22
      if (pool.length) say(this, pool[Math.floor(Math.random() * pool.length)])
    }
    void time
  }
  private runRoutine(dt: number) {
    const st = this.routine[this.step % this.routine.length]
    const resolve = (p: string | V2): V2 => (typeof p === "string" ? places[p] : p)
    if ("go" in st) {
      const t = resolve(st.go)
      if (Math.hypot(t[0] - this.pos[0], t[1] - this.pos[1]) < 0.3) {
        this.advance()
        return
      }
      if (this.timer === 0) {
        this.goTo(t)
        this.timer = 1
        this.anim = this.carry === "sack" || this.carry === "basket" ? "carry" : "walk"
        if (!this.path.length) this.advance()
        return
      }
      this.advance()
    } else if ("do" in st) {
      if (this.timer === 0) {
        this.timer = st.t * (0.8 + Math.random() * 0.4)
        this.anim = st.do
        if (st.face) this.faceTo(resolve(st.face))
        if (st.item !== undefined) {
          this.fig.hold(st.item)
          this.carry = st.item
        }
        this.sayLines = st.say ?? []
        if (st.say && Math.random() < 0.5) this.nextSay = 0.5
        return
      }
      this.timer -= dt
      if (this.timer <= 0) {
        this.anim = "idle"
        this.sayLines = []
        this.advance()
      }
    } else if ("wander" in st) {
      if (this.wanderLeft === 0) this.wanderLeft = st.n
      if (this.timer > 0) {
        this.timer -= dt
        if (this.timer <= 0) this.timer = 0
        else return
      }
      const [x0, z0, x1, z1] = st.wander
      for (let k = 0; k < 10; k++) {
        const t: V2 = [x0 + Math.random() * (x1 - x0), z0 + Math.random() * (z1 - z0)]
        if (isFree(t[0], t[1])) {
          this.goTo(t)
          break
        }
      }
      this.anim = st.anim ?? "walk"
      this.timer = 0.5 + Math.random() * 2.5
      this.wanderLeft--
      if (this.wanderLeft <= 0) {
        this.wanderLeft = 0
        this.timer = 0
        this.advance()
      }
    }
  }
  private advance() {
    this.step++
    this.timer = 0
  }
}

// ---------------------------------------------------------------- animals
export interface Critter {
  update(dt: number, camRight: THREE.Vector3): void
  outline(on: boolean): void
  readonly obj: THREE.Object3D
}
export const critters: Critter[] = []

class SpriteCritter implements Critter {
  get obj() {
    return this.sprite
  }
  outline(on: boolean) {
    outlineSprite(this.sprite, on)
  }
  pos: V2
  target: V2
  wait = 0
  sprite: THREE.Sprite
  frames: THREE.Texture[]
  ft = 0
  flip = false
  constructor(
    scene: THREE.Object3D,
    frames: import("./pix").PixBuf[],
    ppu: number,
    public area: [number, number, number, number],
    public speed: number,
    public kind: "hen" | "cat",
  ) {
    this.frames = frames.map((f) => {
      const t = toTex(f, false)
      t.wrapS = THREE.RepeatWrapping
      return t
    })
    this.pos = [area[0] + Math.random() * (area[2] - area[0]), area[1] + Math.random() * (area[3] - area[1])]
    this.target = [...this.pos] as V2
    this.sprite = addSprite(scene, frames[0], this.pos[0], 0, this.pos[1], ppu)
    this.sprite.material.map = this.frames[0]
  }
  update(dt: number, camRight: THREE.Vector3) {
    const dx = this.target[0] - this.pos[0],
      dz = this.target[1] - this.pos[1],
      d = Math.hypot(dx, dz)
    let frame = 0
    this.ft += dt
    if (d > 0.05 && this.wait <= 0) {
      const v = this.speed * dt
      this.pos[0] += (dx / d) * Math.min(v, d)
      this.pos[1] += (dz / d) * Math.min(v, d)
      this.flip = dx * camRight.x + dz * camRight.z < 0
      frame = this.kind === "hen" ? Math.floor(this.ft * 8) % 2 : 1 + (Math.floor(this.ft * 7) % 2)
    } else {
      this.wait -= dt
      if (this.kind === "hen") frame = Math.sin(this.ft * 3 + this.pos[0]) > 0.3 ? 2 + (Math.floor(this.ft * 6) % 2) : 0
      else frame = Math.sin(this.ft * 0.4 + this.pos[0]) > 0.6 ? 3 : 0
      if (this.wait <= 0) {
        for (let k = 0; k < 6; k++) {
          const t: V2 = [this.area[0] + Math.random() * (this.area[2] - this.area[0]), this.area[1] + Math.random() * (this.area[3] - this.area[1])]
          if (isFree(t[0], t[1])) {
            this.target = t
            break
          }
        }
        this.wait = this.kind === "cat" ? 4 + Math.random() * 10 : 0.5 + Math.random() * 3
      }
    }
    const tex = this.frames[frame]
    tex.repeat.x = this.flip ? -1 : 1
    tex.offset.x = this.flip ? 1 : 0
    this.sprite.material.map = tex
    this.sprite.position.set(this.pos[0], walkH(this.pos[0], this.pos[1]), this.pos[1])
  }
}

class MeshCritter implements Critter {
  outline(on: boolean) {
    outlineShape(this.obj, on)
  }
  pos: V2
  target: V2
  wait = 0
  t = Math.random() * 10
  constructor(
    scene: THREE.Object3D,
    public obj: THREE.Object3D,
    public area: [number, number, number, number],
    public speed: number,
  ) {
    this.pos = [area[0] + 0.5 + Math.random() * (area[2] - area[0] - 1), area[1] + 0.5 + Math.random() * (area[3] - area[1] - 1)]
    this.target = [...this.pos] as V2
    scene.add(obj)
  }
  update(dt: number) {
    this.t += dt
    const dx = this.target[0] - this.pos[0],
      dz = this.target[1] - this.pos[1],
      d = Math.hypot(dx, dz)
    if (d > 0.05) {
      const v = this.speed * dt
      this.pos[0] += (dx / d) * Math.min(v, d)
      this.pos[1] += (dz / d) * Math.min(v, d)
      this.obj.rotation.y = Math.atan2(dx, dz)
      this.obj.position.y = walkH(this.pos[0], this.pos[1]) + Math.abs(Math.sin(this.t * 10)) * 0.03
      this.obj.rotation.x = 0
    } else {
      this.wait -= dt
      this.obj.position.y = walkH(this.pos[0], this.pos[1])
      this.obj.rotation.x = Math.sin(this.t * 0.7) > 0.2 ? 0.25 : 0 // nose down: grazing / rooting
      if (this.wait <= 0) {
        this.target = [this.area[0] + 0.5 + Math.random() * (this.area[2] - this.area[0] - 1), this.area[1] + 0.5 + Math.random() * (this.area[3] - this.area[1] - 1)]
        this.wait = 2 + Math.random() * 6
      }
    }
    this.obj.position.x = this.pos[0]
    this.obj.position.z = this.pos[1]
  }
}

const scaled = (o: THREE.Object3D, s: number) => {
  o.scale.setScalar(s)
  return o
}

export function spawnAnimals(scene: THREE.Object3D) {
  const r = new Rng(5)
  for (let i = 0; i < 9; i++) critters.push(new SpriteCritter(scene, henFrames(i), GPPU * 0.75, i < 6 ? [36.2, 17.9, 40.2, 21.5] : [17, 20.6, 22, 23], 0.7, "hen"))
  critters.push(new SpriteCritter(scene, catFrames(0), GPPU * 0.7, [14.4, 21.8, 17.4, 23.4], 0.9, "cat"))
  critters.push(new SpriteCritter(scene, catFrames(1), GPPU * 0.7, [20, 26.6, 24, 28], 0.9, "cat"))
  critters.push(new SpriteCritter(scene, catFrames(2), GPPU * 0.7, [12, 32, 17, 33.4], 0.9, "cat"))
  for (let i = 0; i < 4; i++) critters.push(new MeshCritter(scene, scaled(pigMesh(), 0.75), [36.6, 26.0, 40.0, 29.0], 0.35 + r.next() * 0.2))
  for (let i = 0; i < 7; i++) critters.push(new MeshCritter(scene, scaled(sheepMesh(), 0.85), [42.6, 30.6, 46.8, 40.3], 0.3 + r.next() * 0.15))
}
