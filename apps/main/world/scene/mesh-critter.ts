import * as THREE from "three"
import { PositionSample } from "#/lib/engine/position-sample"
import { walkH } from "#/world/scene/walk-h"
import type { V2 } from "#/world/scene/construction/registry"
import type { Critter } from "#/world/scene/animal-types"
import { outlineShape } from "#/lib/graphics/outline-shape"
import { LIVESTOCK_GRAZE_PITCH } from "#/world/town/livestock-graze-pitch"

type Props = Readonly<{ scene: THREE.Object3D; obj: THREE.Object3D; area: readonly [number, number, number, number]; speed: number }>

/** Preserve the native livestock movement and grazing pose while keeping one class per module. */
export class MeshCritter implements Critter {
  private readonly ground = new PositionSample(walkH)
  outline(on: boolean) {
    outlineShape(this.obj, on)
  }
  readonly obj: THREE.Object3D
  private readonly state = { pos: [0, 0] satisfies V2, target: [0, 0] satisfies V2, wait: 0, t: Math.random() * 10 }
  get pos(): V2 {
    return [this.state.pos[0], this.state.pos[1]]
  }
  get target(): V2 {
    return [this.state.target[0], this.state.target[1]]
  }
  set target(point: V2) {
    this.state.target = [point[0], point[1]]
  }
  get wait() {
    return this.state.wait
  }
  set wait(value: number) {
    this.state.wait = value
  }
  constructor(private readonly props: Props) {
    const scene = props.scene,
      obj = props.obj,
      area = props.area
    this.obj = obj
    this.state.pos = [area[0] + 0.5 + Math.random() * (area[2] - area[0] - 1), area[1] + 0.5 + Math.random() * (area[3] - area[1] - 1)]
    this.state.target = [this.state.pos[0], this.state.pos[1]]
    scene.add(obj)
    Object.freeze(this)
  }
  update(dt: number) {
    this.state.t += dt
    const dx = this.state.target[0] - this.state.pos[0],
      dz = this.state.target[1] - this.state.pos[1],
      d = Math.hypot(dx, dz)
    if (d > 0.05) {
      const v = this.props.speed * dt
      this.state.pos[0] += (dx / d) * Math.min(v, d)
      this.state.pos[1] += (dz / d) * Math.min(v, d)
      this.obj.rotation.y = Math.atan2(dx, dz)
      this.obj.position.y = this.ground.at(this.state.pos[0], this.state.pos[1]) + Math.abs(Math.sin(this.state.t * 10)) * 0.03
      this.obj.rotation.x = 0
    } else {
      this.state.wait -= dt
      this.obj.position.y = this.ground.at(this.state.pos[0], this.state.pos[1])
      this.obj.rotation.x = Math.sin(this.state.t * 0.7) > 0.2 ? LIVESTOCK_GRAZE_PITCH : 0 // nose down: grazing / rooting
      if (this.state.wait <= 0) {
        this.state.target = [
          this.props.area[0] + 0.5 + Math.random() * (this.props.area[2] - this.props.area[0] - 1),
          this.props.area[1] + 0.5 + Math.random() * (this.props.area[3] - this.props.area[1] - 1),
        ]
        this.state.wait = 2 + Math.random() * 6
      }
    }
    this.obj.position.x = this.state.pos[0]
    this.obj.position.z = this.state.pos[1]
  }
}
