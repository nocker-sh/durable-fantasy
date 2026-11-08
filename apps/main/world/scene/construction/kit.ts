import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { Spot } from "#/world/scene/construction/furnishings"

/**
 * Draws in the piece's own frame: u across its front (−W/2…W/2), v from its back (−D/2) to its
 * front (D/2), y up from the floor.
 */
export class Kit {
  readonly W: number
  readonly D: number
  /**
   * `scale` draws a small thing larger than life, to sit right in a room drawn half again as large
   * (W and D stay the footprint's own).
   */
  constructor(
    readonly gb: GB,
    readonly s: Spot,
    readonly scale = 1,
  ) {
    const side = s.face === 1 || s.face === 3
    this.W = (side ? s.d : s.w) / scale
    this.D = (side ? s.w : s.d) / scale
  }
  /** a point of the frame, in the world */
  at(u: number, v: number): [number, number] {
    const xSource = this.s,
      x = xSource.x,
      z = xSource.z,
      face = xSource.face
    u *= this.scale
    v *= this.scale
    return face === 0 ? [x + u, z + v] : face === 2 ? [x - u, z - v] : face === 1 ? [x + v, z - u] : [x - v, z + u]
  }
  box(inputProps: { side: THREE.Material; top: THREE.Material | null; u0: number; y0: number; v0: number; u1: number; y1: number; v1: number; r?: number }) {
    const side = inputProps.side
    const top = inputProps.top
    const u0 = inputProps.u0
    const y0 = inputProps.y0
    const v0 = inputProps.v0
    const u1 = inputProps.u1
    const y1 = inputProps.y1
    const v1 = inputProps.v1
    const r = inputProps.r === undefined ? 1 : inputProps.r

    const axState = this.at(u0, v0),
      ax = axState[0],
      az = axState[1],
      bxState = this.at(u1, v1),
      bx = bxState[0],
      bz = bxState[1]
    const y = this.s.y,
      k = this.scale
    this.gb.box({ side: side, top: top, x0: Math.min(ax, bx), y0: y + Math.min(y0, y1) * k, z0: Math.min(az, bz), x1: Math.max(ax, bx), y1: y + Math.max(y0, y1) * k, z1: Math.max(az, bz), repeat: r })
  }
  cyl(inputProps: { side: THREE.Material; top: THREE.Material | null; u: number; v: number; y0: number; y1: number; r0: number; r1?: number; seg?: number }) {
    const side = inputProps.side
    const top = inputProps.top
    const u = inputProps.u
    const v = inputProps.v
    const y0 = inputProps.y0
    const y1 = inputProps.y1
    const r0 = inputProps.r0
    const r1 = inputProps.r1 === undefined ? r0 : inputProps.r1
    const seg = inputProps.seg === undefined ? 8 : inputProps.seg

    const xState = this.at(u, v),
      x = xState[0],
      z = xState[1]
    const k = this.scale
    this.gb.cyl({ side: side, top: top, centerX: x, centerZ: z, fromY: this.s.y + y0 * k, toY: this.s.y + y1 * k, fromRadius: r0 * k, toRadius: r1 * k, segments: seg, repeat: 1 })
  }
  /** four square legs, `inset` in from the corners */
  legs(inputProps: { m: THREE.Material; h: number; t?: number; inset?: number; W?: number; D?: number; v?: number }) {
    const m = inputProps.m
    const h = inputProps.h
    const t = inputProps.t === undefined ? 0.05 : inputProps.t
    const inset = inputProps.inset === undefined ? 0.04 : inputProps.inset
    const W = inputProps.W === undefined ? this.W : inputProps.W
    const D = inputProps.D === undefined ? this.D : inputProps.D
    const v = inputProps.v === undefined ? 0 : inputProps.v

    for (const su of [-1, 1])
      for (const sv of [-1, 1]) {
        const u = su * (W / 2 - inset - t / 2),
          vv = v + sv * (D / 2 - inset - t / 2)
        this.box({ side: m, top: null, u0: u - t / 2, y0: 0, v0: vv - t / 2, u1: u + t / 2, y1: h, v1: vv + t / 2 })
      }
  }
  /** a slab: a table top, a shelf board, a seat */
  slab(inputProps: { m: THREE.Material; y: number; t: number; W?: number; D?: number; v?: number; u?: number }) {
    const m = inputProps.m
    const y = inputProps.y
    const t = inputProps.t
    const W = inputProps.W === undefined ? this.W : inputProps.W
    const D = inputProps.D === undefined ? this.D : inputProps.D
    const v = inputProps.v === undefined ? 0 : inputProps.v
    const u = inputProps.u === undefined ? 0 : inputProps.u

    this.box({ side: m, top: m, u0: u - W / 2, y0: y, v0: v - D / 2, u1: u + W / 2, y1: y + t, v1: v + D / 2 })
  }
}
