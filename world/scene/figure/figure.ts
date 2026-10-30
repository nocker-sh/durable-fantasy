import { FIG_PPU } from "#/world/scene/figure/display-scale"
import * as THREE from "three"

import { FW, FH, OY } from "#/world/scene/figure/render"
import type { Item } from "#/world/scene/figure/look"
import type { Anim } from "#/world/scene/figure/animation"
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1a1420, transparent: true, opacity: 0.32, depthWrite: false })

const cardGeo = new THREE.PlaneGeometry(FW / FIG_PPU, FH / FIG_PPU).translate(0, (FH / 2 - (FH - OY)) / FIG_PPU, 0)

const shadowGeo = new THREE.CircleGeometry(0.26, 12)

const MAX_STRIPS = 16

const tmpV = new THREE.Vector3()
import { FIG } from "#/world/scene/figure/display-scale"

import { FRAMES } from "#/world/scene/figure/animation"
import type { Look } from "#/world/scene/figure/look"

import { bakedStrip } from "#/world/scene/baked-strip"
import { lookKey } from "#/world/scene/sprite-key"
import { spriteFrame } from "#/world/scene/sprite-frame"
import { view } from "#/world/scene/actors"
import type { Strip, BakedStrips } from "#/world/scene/actors"

/** Villager drawn as an 8-direction pixel sprite; strips are rendered on demand. */
export class Figure {
  root = new THREE.Group()
  private shadow = new THREE.Mesh(shadowGeo, shadowMat)
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
    readonly scale = 1,
  ) {
    this.root.scale.setScalar(scale)
    this.sprite = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ alphaTest: 0.5, color: view.tint }))
    this.sprite.position.y = 0.02
    this.sprite.visible = false
    const sh = this.shadow
    sh.rotation.x = -Math.PI / 2
    sh.position.y = 0.03
    sh.scale.set((look.age === "child" ? 0.75 : 1) * FIG, FIG, (look.age === "child" ? 0.6 : 0.8) * FIG)
    this.root.add(this.sprite, sh)
    this.height = (look.age === "child" ? 1.25 : 1.65) * FIG * scale
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
    for (const v = { value: 0 }; v.value < 8; v.value++) this.want({ anim: anim, item: item, v: v.value, f: 0, urgency: -500 })
  }
  private strip(anim: Anim, item: Item, v: number): Strip {
    const key = anim + "|" + item + "|" + v
    const s = { value: this.strips.get(key) }
    if (s.value) {
      this.strips.delete(key)
      this.strips.set(key, s.value)
    } else {
      // Never release a texture still referenced by the visible figure or its overlays.
      for (const entry of this.strips) {
        const oldKey = entry[0]
        const old = entry[1]

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
      s.value = { canvas, ctx: canvas.getContext("2d")!, tex, ready: new Uint8Array(count), requested: new Uint8Array(count), count }
      this.strips.set(key, s.value)
    }
    return s.value
  }
  /** Request one frame; it is drawn into its strip when it arrives. */
  private want(inputProps: { anim: Anim; item: Item; v: number; f: number; urgency: number }) {
    const anim = inputProps.anim
    const item = inputProps.item
    const v = inputProps.v
    const f = inputProps.f
    const urgency = inputProps.urgency

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
    const data = spriteFrame({ look: this.look, item: item, anim: anim, view: v, f: f, urgency: urgency, onReady: done, id: this.id + "|" + item })
    if (data) done(data)
  }
  groundOffset(height: number) {
    this.shadow.position.y = (0.03 - height) / this.scale
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
    const rel = { value: view.yaw - this.heading }
    rel.value = ((rel.value % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const v = Math.round(rel.value / (Math.PI / 4)) % 8
    this.root.getWorldPosition(tmpV)
    const xSource = tmpV,
      x = xSource.x,
      y = xSource.y,
      z = xSource.z
    const dist = tmpV.distanceTo(view.cam)
    tmpV.y += this.height * 0.5
    const seen = view.frustum.containsPoint(tmpV)
    const s = this.strip(this.anim, this.item, v)
    const n = s.count
    const f = Math.floor(((((this.t / (Math.PI * 2)) % 1) + 1) % 1) * n) % n
    // on screen: this frame first, then the rest of the loop; off screen: just this frame, last
    if (seen) {
      this.want({ anim: this.anim, item: this.item, v: v, f: f, urgency: 400 - dist })
      for (const k = { value: 1 }; k.value < n; k.value++) this.want({ anim: this.anim, item: this.item, v: v, f: (f + k.value) % n, urgency: 200 - dist - k.value })
    } else this.want({ anim: this.anim, item: this.item, v: v, f: f, urgency: -1000 - dist })
    const show: { value: Strip | null } = { value: null },
      frame = { value: f }
    if (s.ready[f]) show.value = s
    else {
      for (const k = { value: 1 }; k.value < n && !show.value; k.value++) {
        if (s.ready[(f + k.value) % n]) {
          show.value = s
          frame.value = (f + k.value) % n
        } else if (s.ready[(f - k.value + n) % n]) {
          show.value = s
          frame.value = (f - k.value + n) % n
        }
      }
      if (!show.value) {
        const idle = this.anim !== "idle" ? this.strip("idle", this.item, v) : null
        if (idle && seen) this.want({ anim: "idle", item: this.item, v: v, f: 0, urgency: 300 - dist })
        const any = idle && idle.ready.indexOf(1) >= 0 ? idle : [...this.strips.values()].find((x) => x.ready.indexOf(1) >= 0)
        if (any) {
          show.value = any
          frame.value = any.ready.indexOf(1)
        }
      }
    }
    if (!show.value) {
      this.sprite.visible = false
      return
    }
    show.value.tex.offset.x = frame.value / show.value.count
    const m = this.sprite.material
    if (m.map !== show.value.tex) {
      m.map = show.value.tex
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
