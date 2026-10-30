import { FIG } from "#/world/scene/figure/display-scale"
import { seatedRoot } from "#/world/scene/seated-root"
import type { SeatedPlace } from "#/world/scene/seated-pose"
import * as THREE from "three"
import { PositionSample } from "#/lib/engine/position-sample"
import { walkH } from "#/world/scene/walk-h"
import { isFree } from "#/world/scene/is-free"
import { findPath } from "#/world/scene/path"
import { places } from "#/world/scene/construction/registry"
import type { V2 } from "#/world/scene/construction/registry"
import { ANIM_DUR } from "#/world/scene/figure/animation"
import type { Look, Item } from "#/world/scene/figure/look"
import type { Anim } from "#/world/scene/figure/animation"
import type { BakedStrips, Step } from "#/world/scene/actors"
import { Figure } from "#/world/scene/figure/figure"

export class Actor {
  seat: SeatedPlace | null = null
  private readonly ground = new PositionSample(walkH)
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
  public name: string
  public job: string
  private look: Look
  public routine: Step[]
  public lines: string[]
  constructor(inputProps: {
    name: string
    job: string
    look: Look
    start: V2
    routine: Step[]
    lines: string[]
    scene: THREE.Object3D
    speed?: number
    item?: Item
    baked?: BakedStrips
    figureScale?: number
  }) {
    const name = inputProps.name
    const job = inputProps.job
    const look = inputProps.look
    const start = inputProps.start
    const routine = inputProps.routine
    const lines = inputProps.lines
    const scene = inputProps.scene
    const speed = inputProps.speed === undefined ? 1.2 : inputProps.speed
    const item = inputProps.item === undefined ? null : inputProps.item
    const baked = inputProps.baked
    const figureScale = inputProps.figureScale === undefined ? 1 : inputProps.figureScale
    this.name = name
    this.job = job
    this.look = look
    this.routine = routine
    this.lines = lines

    this.fig = new Figure(look, baked, figureScale)
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
    const seat = this.path.length ? null : this.seat
    const xState = { value: seat?.at ?? this.pos },
      x = { value: xState.value[0] },
      z = { value: xState.value[1] }
    const placed = seat ? seatedRoot({ look: this.look, time: this.animT, place: seat, scale: FIG * this.fig.scale }) : null
    if (placed) {
      x.value = placed[0]
      z.value = placed[2]
    }
    const lift = placed?.[1] ?? 0
    this.fig.root.position.set(x.value, this.ground.at(this.pos[0], this.pos[1]) + lift, z.value)
    this.fig.groundOffset(lift)
    if (seat) this.heading = seat.heading
    this.fig.face(this.heading)
    this.fig.refresh()
  }
  goTo(t: V2) {
    const p = findPath(this.pos, t)
    this.path = p ? p.slice(1) : []
  }
  faceTo(t: V2) {
    if (this.seat && !this.path.length) return
    this.heading = Math.atan2(t[0] - this.pos[0], t[1] - this.pos[1])
  }
  update(dt: number, time: number, say: (a: Actor, s: string) => void) {
    this.animT += dt * (this.anim === "walk" || this.anim === "carry" ? (9 * this.speed) / 1.2 : this.anim === "play" ? 12 : (Math.PI * 2) / ANIM_DUR[this.anim])
    if (this.path.length) {
      const txState = this.path[0],
        tx = txState[0],
        tz = txState[1]
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
        const diff = { value: target - this.heading }
        while (diff.value > Math.PI) diff.value -= Math.PI * 2
        while (diff.value < -Math.PI) diff.value += Math.PI * 2
        this.heading += diff.value * Math.min(1, dt * 10)
      }
      if (this.anim !== "carry" && this.anim !== "play") this.anim = "walk"
      if (!this.path.length) this.anim = "idle"
    } else if (this.seat) this.anim = "sit"
    else if (this.routine.length) this.runRoutine(dt)
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
      const x0State = st.wander,
        x0 = x0State[0],
        z0 = x0State[1],
        x1 = x0State[2],
        z1 = x0State[3]
      for (const k = { value: 0 }; k.value < 10; k.value++) {
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
