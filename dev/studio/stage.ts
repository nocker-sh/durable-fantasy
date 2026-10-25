// Motion studio stage: one villager on a tiled floor. Click a tile to walk there one tile
// at a time (8 directions); pick a motion to play it in place, with the prop that explains
// it (a tree to chop, a well, water to swim in) set on the tile in front or underneath.
import { FW, FH, OX, OY, type Look, type Item } from "#/world/scene/figure.ts"
import { SpriteCache, frameAt } from "#/world/scene/sprites.ts"
import { tickSprites } from "#/world/scene/sprite-pool.ts"
import { propSprite, PROP_PLACE, PROP_DIST } from "./props.ts"
import type { Motion } from "./motions.ts"

export type { Look, Item, Motion }

export const TILE = 24 // sprite px per tile
const WALK_TPS = 2.4 // tiles per second
const FLOOR = ["#b8a88c", "#b0a084"]
/** Screen step for each facing: 0 = down, 2 = left, 4 = up, 6 = right (the renderer's views). */
export const DIRS: [number, number][] = [
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
]
const WALK = "Walk",
  IDLE = "Idle_A"

export interface StageState {
  tx: number
  ty: number
  dir: number
  clip: string
  walking: boolean
}

export class Stage {
  zoom = 3
  onChange?: (s: StageState) => void

  private ctx: CanvasRenderingContext2D
  private sprites = new SpriteCache()
  private item: Item = null
  private motion: Motion | null = null
  private tx = 0
  private ty = 0 // tile the character stands on (or leaves)
  private px = 0
  private py = 0 // position in tiles, for drawing
  private dir = 0
  private path: [number, number][] = []
  private t = 0
  private hover: [number, number] | null = null
  private target: [number, number] | null = null
  private raf = 0
  private last = 0
  private ro: ResizeObserver
  private reported: StageState | null = null

  constructor(
    private canvas: HTMLCanvasElement,
    look: Look,
    item: Item = null,
  ) {
    this.ctx = canvas.getContext("2d")!
    this.item = item
    this.sprites.setLook("me", look, item)
    this.warmBasics()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas.parentElement ?? canvas)
    this.resize()
    canvas.addEventListener("pointerdown", this.onDown)
    canvas.addEventListener("pointermove", this.onMove)
    canvas.addEventListener("pointerleave", this.onLeave)
    this.raf = requestAnimationFrame(this.tick)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.canvas.removeEventListener("pointerdown", this.onDown)
    this.canvas.removeEventListener("pointermove", this.onMove)
    this.canvas.removeEventListener("pointerleave", this.onLeave)
  }

  setLook(look: Look, item: Item = this.item) {
    this.item = item
    this.sprites.setLook("me", look, item)
    this.warmBasics()
  }
  setZoom(z: number) {
    this.zoom = z
  }
  /** Face one of the 8 directions (0 = toward the viewer, then clockwise on screen). */
  setDir(d: number) {
    this.dir = ((d % 8) + 8) % 8
  }
  /** Play a motion in place; null goes back to standing. Walking cancels it. */
  play(m: Motion | null) {
    this.motion = m
    this.path = []
    this.target = null
    this.px = this.tx
    this.py = this.ty
    this.t = 0
    if (m) this.sprites.warm("me", m.clip, this.viewsFrom(this.dir), m.seatY)
  }

  private warmBasics() {
    const views = this.viewsFrom(this.dir)
    this.sprites.warm("me", IDLE, views)
    this.sprites.warm("me", WALK, views)
    if (this.motion) this.sprites.warm("me", this.motion.clip, views, this.motion.seatY)
  }
  private viewsFrom(v: number) {
    return [v, ...[0, 1, 2, 3, 4, 5, 6, 7].filter((x) => x !== v)]
  }

  private resize() {
    const box = this.canvas.parentElement ?? this.canvas
    const w = Math.max(1, Math.floor(box.clientWidth))
    const h = Math.max(1, Math.floor(window.innerHeight - box.getBoundingClientRect().top))
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  // ---- input: tiles under the pointer
  private tileAt(e: PointerEvent): [number, number] {
    const r = this.canvas.getBoundingClientRect()
    const sx = (e.clientX - r.left) * (this.canvas.width / r.width),
      sy = (e.clientY - r.top) * (this.canvas.height / r.height)
    const s = TILE * this.zoom
    return [Math.floor((sx - this.canvas.width / 2) / s + this.px + 0.5), Math.floor((sy - this.canvas.height / 2) / s + this.py + 0.5)]
  }
  private onMove = (e: PointerEvent) => {
    this.hover = this.tileAt(e)
  }
  private onLeave = () => {
    this.hover = null
  }
  private onDown = (e: PointerEvent) => {
    const [gx, gy] = this.tileAt(e)
    if (gx === this.tx && gy === this.ty && !this.path.length) return
    this.motion = null
    this.target = [gx, gy]
    // start from the tile being walked to, so a new click mid-step never snaps back
    const [sx, sy] = this.path[0] ?? [this.tx, this.ty]
    this.path = this.path.length ? [[sx, sy], ...line(sx, sy, gx, gy)] : line(sx, sy, gx, gy)
  }

  private tick = (now: number) => {
    const dt = Math.min(0.1, this.last ? (now - this.last) / 1000 : 0)
    this.last = now
    tickSprites()
    this.update(dt)
    this.draw()
    this.raf = requestAnimationFrame(this.tick)
  }

  private update(dt: number) {
    let left = WALK_TPS * dt
    while (left > 0 && this.path.length) {
      const [nx, ny] = this.path[0]
      const dx = nx - this.px,
        dy = ny - this.py,
        d = Math.hypot(dx, dy)
      if (d > 1e-6) this.dir = (Math.round(Math.atan2(-dx, dy) / (Math.PI / 4)) + 8) % 8
      if (d <= left) {
        this.px = nx
        this.py = ny
        this.tx = nx
        this.ty = ny
        this.path.shift()
        left -= d
      } else {
        this.px += (dx / d) * left
        this.py += (dy / d) * left
        left = 0
      }
    }
    if (!this.path.length) this.target = null
    this.t += dt
    // tell the page only when something it shows changed
    const next = { tx: this.tx, ty: this.ty, dir: this.dir, clip: this.clip(), walking: this.path.length > 0 }
    const was = this.reported
    if (!was || was.tx !== next.tx || was.ty !== next.ty || was.dir !== next.dir || was.clip !== next.clip || was.walking !== next.walking) {
      this.reported = next
      this.onChange?.(next)
    }
  }

  private clip() {
    return this.path.length ? WALK : (this.motion?.clip ?? IDLE)
  }

  private draw() {
    const { ctx, canvas: cv, zoom: z } = this
    const W = cv.width,
      H = cv.height,
      s = TILE * z
    ctx.imageSmoothingEnabled = false
    // the camera follows the character; tile centers sit on integer tile coords
    const ox = W / 2 - this.px * s,
      oy = H / 2 - this.py * s
    const scr = (tx: number, ty: number): [number, number] => [Math.round(tx * s + ox), Math.round(ty * s + oy)]
    const c0 = Math.floor(-ox / s - 0.5),
      r0 = Math.floor(-oy / s - 0.5)
    for (let r = r0; (r - 0.5) * s + oy < H; r++)
      for (let c = c0; (c - 0.5) * s + ox < W; c++) {
        ctx.fillStyle = FLOOR[(r + c) & 1]
        const [x, y] = scr(c - 0.5, r - 0.5)
        ctx.fillRect(x, y, Math.ceil(s), Math.ceil(s))
      }
    const outlineTile = (t: [number, number], a: number) => {
      const [x, y] = scr(t[0] - 0.5, t[1] - 0.5)
      ctx.strokeStyle = `rgba(42,34,48,${a})`
      ctx.lineWidth = Math.max(1, Math.round(z / 2))
      ctx.strokeRect(x + 0.5, y + 0.5, Math.ceil(s) - 1, Math.ceil(s) - 1)
    }
    if (this.hover) outlineTile(this.hover, 0.25)
    if (this.target) outlineTile(this.target, 0.6)

    // the motion's prop, placed by facing
    const m = this.path.length ? null : this.motion
    const prop = m?.prop
    const place = prop ? PROP_PLACE[prop] : null
    let propAt: [number, number] | null = null
    if (prop) {
      const [dx, dy] = DIRS[this.dir],
        k = PROP_DIST[prop] ?? 1
      propAt = place === "under" ? [this.tx, this.ty] : place === "behind" ? [this.tx - dx, this.ty - dy] : [this.tx + dx * k, this.ty + dy * k]
    }
    const drawProp = () => {
      const p = propSprite(prop!)
      const [x, y] = scr(propAt![0], propAt![1])
      const flip = place === "front" && (this.dir === 5 || this.dir === 6 || this.dir === 7)
      ctx.save()
      if (flip) {
        ctx.translate(x, 0)
        ctx.scale(-1, 1)
        ctx.translate(-x, 0)
      }
      ctx.drawImage(toCanvas(p.buf), x - p.ax * z, y - p.ay * z, p.buf.w * z, p.buf.h * z)
      ctx.restore()
    }
    const [cx, cy] = scr(this.px, this.py)
    const drawMe = () => {
      ctx.fillStyle = "rgba(0,0,0,.18)"
      ctx.beginPath()
      ctx.ellipse(cx, cy, 14 * z, 4 * z, 0, 0, Math.PI * 2)
      ctx.fill()
      const clip = this.clip(),
        seatY = this.path.length ? undefined : m?.seatY
      const spr = this.sprites.get("me", clip, this.dir, frameAt(clip, this.t, seatY), seatY)
      if (!spr) return
      const dx = cx - OX * z,
        dy = cy - (OY - (m?.sink ?? 0)) * z
      if (prop !== "pond") {
        ctx.drawImage(spr, dx, dy, FW * z, FH * z)
        return
      }
      // swimming: the body above the waterline, the rest seen faintly through the water
      const wl = cy - 6 * z
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, W, wl)
      ctx.clip()
      ctx.drawImage(spr, dx, dy, FW * z, FH * z)
      ctx.restore()
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx, cy, 36 * z, 14 * z, 0, 0, Math.PI * 2)
      ctx.clip()
      ctx.globalAlpha = 0.35
      ctx.drawImage(spr, dx, dy, FW * z, FH * z)
      ctx.globalAlpha = 1
      ctx.fillStyle = "rgba(69,105,138,.6)"
      ctx.fillRect(cx - 40 * z, wl, 80 * z, 24 * z)
      ctx.fillStyle = "rgba(166,194,194,.55)"
      ctx.fillRect(cx - 40 * z, wl, 80 * z, Math.max(1, z))
      ctx.restore()
    }
    // painter's order: under-props first, then whatever stands further back
    if (prop && place === "under") drawProp()
    if (prop && place !== "under" && propAt![1] <= this.ty) {
      drawProp()
      drawMe()
    } else {
      drawMe()
      if (prop && place !== "under") drawProp()
    }
  }
}

/** Tiles from (x0,y0) to (x1,y1), diagonal steps first then straight (excludes the start). */
function line(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const out: [number, number][] = []
  let x = x0,
    y = y0
  while (x !== x1 || y !== y1) {
    x += Math.sign(x1 - x)
    y += Math.sign(y1 - y)
    out.push([x, y])
  }
  return out
}

const bufCanvas = new WeakMap<object, HTMLCanvasElement>()
function toCanvas(buf: { w: number; h: number; data: Uint8ClampedArray<ArrayBuffer> }) {
  let c = bufCanvas.get(buf)
  if (!c) {
    c = document.createElement("canvas")
    c.width = buf.w
    c.height = buf.h
    c.getContext("2d")!.putImageData(new ImageData(buf.data, buf.w, buf.h), 0, 0)
    bufCanvas.set(buf, c)
  }
  return c
}
