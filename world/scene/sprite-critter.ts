import * as THREE from "three"
import { PositionSample } from "#/lib/engine/position-sample"
import { walkH } from "#/world/scene/walk-h"
import { isFree } from "#/world/scene/is-free"
import type { V2 } from "#/world/scene/construction/registry"
import type { Critter } from "#/world/scene/animal-types"
import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { outlineSprite } from "#/lib/graphics/outline-sprite"

type Props = Readonly<{ scene: THREE.Object3D; frames: readonly PixBuf[]; ppu: number; area: readonly [number, number, number, number]; speed: number; kind: "hen" | "cat" }>

/** Preserve sprite animation and walk targets independently from mesh livestock. */
export class SpriteCritter implements Critter {
  private readonly ground = new PositionSample(walkH)
  get obj() {
    return this.sprite
  }
  outline(on: boolean) {
    outlineSprite(this.sprite, on)
  }
  private readonly state = { pos: [0, 0] satisfies V2, target: [0, 0] satisfies V2, wait: 0, ft: 0, flip: false }
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
  private readonly sprite: THREE.Sprite
  private readonly frames: THREE.Texture[]
  constructor(private readonly props: Props) {
    const scene = props.scene,
      frames = props.frames,
      ppu = props.ppu,
      area = props.area
    this.frames = frames.map((f) => {
      const t = toTex(f, false)
      t.wrapS = THREE.RepeatWrapping
      return t
    })
    this.state.pos = [area[0] + Math.random() * (area[2] - area[0]), area[1] + Math.random() * (area[3] - area[1])]
    this.state.target = [this.state.pos[0], this.state.pos[1]]
    this.sprite = addSprite({ root: scene, b: frames[0], x: this.state.pos[0], y: 0, z: this.state.pos[1], ppu: ppu })
    this.sprite.material.map = this.frames[0]
    Object.freeze(this)
  }
  update(dt: number, camRight: THREE.Vector3) {
    const dx = this.state.target[0] - this.state.pos[0],
      dz = this.state.target[1] - this.state.pos[1],
      d = Math.hypot(dx, dz)
    let frame = 0
    this.state.ft += dt
    if (d > 0.05 && this.state.wait <= 0) {
      const v = this.props.speed * dt
      this.state.pos[0] += (dx / d) * Math.min(v, d)
      this.state.pos[1] += (dz / d) * Math.min(v, d)
      this.state.flip = dx * camRight.x + dz * camRight.z < 0
      frame = this.props.kind === "hen" ? Math.floor(this.state.ft * 8) % 2 : 1 + (Math.floor(this.state.ft * 7) % 2)
    } else {
      this.state.wait -= dt
      if (this.props.kind === "hen") frame = Math.sin(this.state.ft * 3 + this.state.pos[0]) > 0.3 ? 2 + (Math.floor(this.state.ft * 6) % 2) : 0
      else frame = Math.sin(this.state.ft * 0.4 + this.state.pos[0]) > 0.6 ? 3 : 0
      if (this.state.wait <= 0) {
        for (let k = 0; k < 6; k++) {
          const t: V2 = [this.props.area[0] + Math.random() * (this.props.area[2] - this.props.area[0]), this.props.area[1] + Math.random() * (this.props.area[3] - this.props.area[1])]
          if (isFree(t[0], t[1])) {
            this.state.target = t
            break
          }
        }
        this.state.wait = this.props.kind === "cat" ? 4 + Math.random() * 10 : 0.5 + Math.random() * 3
      }
    }
    const tex = this.frames[frame]
    tex.repeat.x = this.state.flip ? -1 : 1
    tex.offset.x = this.state.flip ? 1 : 0
    this.sprite.material.map = tex
    this.sprite.position.set(this.state.pos[0], this.ground.at(this.state.pos[0], this.state.pos[1]), this.state.pos[1])
  }
}
