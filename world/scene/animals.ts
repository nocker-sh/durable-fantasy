import * as THREE from "three"
import { PositionSample } from "#/lib/engine/position-sample.ts"
import { walkH, isFree } from "./world"
import type { V2 } from "./construction/registry.ts"
import { pigMesh, sheepMesh } from "./construction/livestock.ts"
import { addSprite } from "./construction/sprites.ts"
import { toTex } from "./gfx"
import { henFrames, catFrames, GPPU } from "./goods"
import { Rng } from "./pix"
import { outlineShape, outlineSprite } from "./outline"

export interface Critter {
  update(dt: number, camRight: THREE.Vector3): void
  outline(on: boolean): void
  readonly obj: THREE.Object3D
}
export const critters: Critter[] = []

class SpriteCritter implements Critter {
  private readonly ground = new PositionSample(walkH)
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
    this.sprite.position.set(this.pos[0], this.ground.at(this.pos[0], this.pos[1]), this.pos[1])
  }
}

class MeshCritter implements Critter {
  private readonly ground = new PositionSample(walkH)
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
      this.obj.position.y = this.ground.at(this.pos[0], this.pos[1]) + Math.abs(Math.sin(this.t * 10)) * 0.03
      this.obj.rotation.x = 0
    } else {
      this.wait -= dt
      this.obj.position.y = this.ground.at(this.pos[0], this.pos[1])
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
