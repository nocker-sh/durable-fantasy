import { outlineShape } from "#/lib/graphics/outline-shape"
import * as THREE from "three"
import type { V2 } from "#/world/scene/construction/registry"
import { Rng } from "#/lib/engine/random"
import { groundH } from "#/world/scene/ground-h"
import { isFree } from "#/world/scene/is-free"
import { slimeBody } from "#/world/scene/fields/slime-body"

export class Slime {
  get obj() {
    return this.body
  }
  outline(on: boolean) {
    outlineShape(this.body, on)
  }
  pos: V2
  target: V2
  t = 0
  hop = 0
  wait: number
  body: THREE.Group
  r: Rng
  public area: [number, number, number, number]
  constructor(inputProps: { root: THREE.Group; area: [number, number, number, number]; seed: number; color: number }) {
    const root = inputProps.root
    const area = inputProps.area
    const seed = inputProps.seed
    const color = inputProps.color
    this.area = area

    this.r = new Rng(seed)
    this.pos = [area[0] + this.r.next() * (area[2] - area[0]), area[1] + this.r.next() * (area[3] - area[1])]
    this.target = [...this.pos] as V2
    this.wait = this.r.next() * 3
    this.body = slimeBody(color)
    root.add(this.body)
  }
  update(dt: number) {
    this.t += dt
    const dx = this.target[0] - this.pos[0],
      dz = this.target[1] - this.pos[1],
      d = Math.hypot(dx, dz)
    if (this.wait > 0) {
      this.wait -= dt
      if (this.wait <= 0) {
        for (const k = { value: 0 }; k.value < 8; k.value++) {
          const a = this.area,
            x = Math.min(a[2], Math.max(a[0], this.pos[0] + (this.r.next() - 0.5) * 1.6)),
            z = Math.min(a[3], Math.max(a[1], this.pos[1] + (this.r.next() - 0.5) * 1.6))
          if (isFree(x, z)) {
            this.target = [x, z]
            break
          }
        }
      }
    } else if (d < 0.05) {
      this.wait = 12 + this.r.next() * 20
    } else {
      // bounce along in little hops
      this.hop = (this.hop + dt * 2.2) % 1
      const v = Math.min(d, dt * 0.9)
      this.pos[0] += (dx / d) * v
      this.pos[1] += (dz / d) * v
      this.body.rotation.y = Math.atan2(dx, dz)
    }
    const lift = this.wait > 0 ? 0 : Math.sin(this.hop * Math.PI) * 0.22
    const squash = this.wait > 0 ? 1 + Math.sin(this.t * 2.4) * 0.035 : 1 - Math.sin(this.hop * Math.PI * 2) * 0.1
    this.body.position.set(this.pos[0], groundH(this.pos[0], this.pos[1]) + 0.06 + lift, this.pos[1])
    this.body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash))
  }
}
