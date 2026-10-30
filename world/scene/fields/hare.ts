import { outlineShape } from "#/lib/graphics/outline-shape"
import * as THREE from "three"
import type { V2 } from "#/world/scene/construction/registry"
import { Rng } from "#/lib/engine/random"
import { groundH } from "#/world/scene/ground-h"
import { isFree } from "#/world/scene/is-free"
import { hareBody } from "#/world/scene/fields/hare-body"

/** A hare: sits, nibbles, darts off a few steps. */
export class Hare {
  get obj() {
    return this.body
  }
  outline(on: boolean) {
    outlineShape(this.body, on)
  }
  pos: V2
  target: V2
  wait: number
  body: THREE.Group
  r: Rng
  t = 0
  constructor(
    root: THREE.Group,
    public area: [number, number, number, number],
    seed: number,
  ) {
    this.r = new Rng(seed)
    this.pos = [area[0] + this.r.next() * (area[2] - area[0]), area[1] + this.r.next() * (area[3] - area[1])]
    this.target = [...this.pos] as V2
    this.wait = this.r.next() * 4
    this.body = hareBody()
    root.add(this.body)
  }
  update(dt: number) {
    this.t += dt
    const dx = this.target[0] - this.pos[0],
      dz = this.target[1] - this.pos[1],
      d = Math.hypot(dx, dz)
    const lift = { value: 0 }
    if (this.wait > 0) {
      this.wait -= dt
      if (this.wait <= 0) {
        const a = this.r.next() * Math.PI * 2,
          far = 1 + this.r.next() * 2.5
        const x = Math.min(this.area[2], Math.max(this.area[0], this.pos[0] + Math.cos(a) * far))
        const z = Math.min(this.area[3], Math.max(this.area[1], this.pos[1] + Math.sin(a) * far))
        if (isFree(x, z)) this.target = [x, z]
        else this.wait = 1
      }
    } else if (d < 0.05) this.wait = 2 + this.r.next() * 5
    else {
      const v = Math.min(d, dt * 2.6)
      this.pos[0] += (dx / d) * v
      this.pos[1] += (dz / d) * v
      this.body.rotation.y = Math.atan2(dx, dz)
      lift.value = Math.abs(Math.sin(this.t * 14)) * 0.08
    }
    this.body.position.set(this.pos[0], groundH(this.pos[0], this.pos[1]) + lift.value, this.pos[1])
  }
}
