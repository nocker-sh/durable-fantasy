import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { Rng } from "#/lib/engine/random"
import { gableTex } from "#/world/scene/textures/gable-tex"
import type { HouseStyle } from "#/world/town/style"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import type { V2 } from "#/world/scene/construction/registry"
import { chimneys, places } from "#/world/scene/construction/registry"
import { occluder } from "#/world/scene/construction/occluder"
import { M } from "#/world/scene/construction/materials"
import { baseOf } from "#/world/scene/construction/helpers/houses/base-of"
import { wallMat } from "#/world/scene/construction/helpers/houses/wall-mat"
import type { HouseOpts } from "#/world/scene/construction/houses"
import { oriels, SIDE } from "#/world/scene/construction/houses"
import { sideOf } from "#/world/scene/construction/helpers/houses/side-of"
import { bboxOf } from "#/world/scene/construction/helpers/houses/bbox-of"
import { roofMat } from "#/world/scene/construction/helpers/houses/roof-mat"
import { hangSign } from "#/world/scene/construction/helpers/houses/hang-sign"

export function houseInner(root: THREE.Group, o: HouseOpts) {
  const gb = new GB()
  const x0Source = o,
    x0 = x0Source.x0,
    z0 = x0Source.z0,
    x1 = x0Source.x1,
    z1 = x0Source.z1
  const loSource = baseOf({ x0: x0, z0: z0, x1: x1, z1: z1 }),
    lo = loSource.lo,
    hi = loSource.hi
  const y0 = hi + 0.18
  const FH = 1.5
  // plinth
  gb.box({ side: M.stoneDark, top: M.stone, x0: x0 - 0.06, y0: lo - 0.6, z0: z0 - 0.06, x1: x1 + 0.06, y1: y0, z1: z1 + 0.06, repeat: 4 })
  const y = { value: y0 }
  const doorWorld: V2 = [0, 0]
  const st: HouseStyle = o.style ?? {
    roofShape: "gable",
    wall: (o.timber ?? true) ? "timber" : "plaster",
    roofRamp: o.roof,
    windows: "leaded",
    shutter: "cGreen",
    door: o.sign ? "arched" : "plank",
    chimneys: o.chimney === false ? 0 : 1,
    jetty: o.floors > 1,
  }
  for (const f = { value: 0 }; f.value < o.floors; f.value++) {
    // a timber house's upper floor overhangs the lower; other walls rise straight
    const ins = st.jetty && f.value === 0 ? 0.14 : 0
    const a = x0 + ins,
      b = x1 - ins,
      c = z0 + ins,
      d = z1 - ins
    const faces: [string, number][] = [
      ["s", b - a],
      ["n", b - a],
      ["e", d - c],
      ["w", d - c],
    ]
    const mats: Record<string, THREE.Material> = {}
    faces.forEach((entry, k) => {
      const side = entry[0]
      const w = entry[1]

      const door = f.value === 0 && o.door.side === side ? o.door.u - ins : undefined
      mats[side] = wallMat({
        w: w,
        h: FH,
        seed: o.seed * 10 + f.value * 4 + k,
        opts: {
          door,
          timber: st.wall === "timber",
          ramp: o.ramp,
          opening: f.value === 0 && o.opening === side,
          windows: true,
          material: st.wall === "timber" ? "plaster" : st.wall,
          windowKind: st.windows,
          doorKind: st.door,
          shutter: st.shutter,
        },
      })
    })
    const Y = y.value + FH
    gb.quad({ material: mats.s, a: [a, y.value, d], b: [b, y.value, d], c: [b, Y, d], d: [a, Y, d] })
    gb.quad({ material: mats.n, a: [b, y.value, c], b: [a, y.value, c], c: [a, Y, c], d: [b, Y, c] })
    gb.quad({ material: mats.e, a: [b, y.value, d], b: [b, y.value, c], c: [b, Y, c], d: [b, Y, d] })
    gb.quad({ material: mats.w, a: [a, y.value, c], b: [a, y.value, d], c: [a, Y, d], d: [a, Y, c] })
    if (ins > 0) gb.box({ side: M.woodDark, top: M.woodDark, x0: x0, y0: Y - 0.08, z0: z0, x1: x1, y1: Y + 0.02, z1: z1, repeat: 2 }) // jetty beam
    y.value = Y
  }
  // an oriel: on most houses of two floors a little bay of windows stands out from the upper
  // floor on the front, away from the door, on brackets of its own and under a roof of its own
  if (o.floors > 1 && o.seed % 3 !== 1) {
    const side = o.door.side,
      cSource = sideOf(o, side),
      c = cSource.c,
      len = cSource.len,
      nSource = SIDE[side],
      n = nSource.n,
      t = nSource.t
    const along = o.door.u < len / 2 ? len * 0.24 : -len * 0.24 // from the middle, on the other half from the door
    if (len > 3) {
      const W = 1.1,
        D = 0.36,
        yb = y0 + FH + 0.12,
        yt = y0 + 2 * FH - 0.12
      const at = (u: number, out: number): V2 => [c[0] + t[0] * (along + u) + n[0] * out, c[1] + t[1] * (along + u) + n[1] * out]
      const box = (inputProps: { side: THREE.Material; top: THREE.Material; u0: number; o0: number; ya: number; u1: number; o1: number; yb2: number }) => {
        const side = inputProps.side
        const top = inputProps.top
        const u0 = inputProps.u0
        const o0 = inputProps.o0
        const ya = inputProps.ya
        const u1 = inputProps.u1
        const o1 = inputProps.o1
        const yb2 = inputProps.yb2

        const p = at(u0, o0),
          q2 = at(u1, o1)
        gb.box({ side: side, top: top, x0: Math.min(p[0], q2[0]), y0: ya, z0: Math.min(p[1], q2[1]), x1: Math.max(p[0], q2[0]), y1: yb2, z1: Math.max(p[1], q2[1]), repeat: 2 })
      }
      box({ side: st.wall === "timber" ? M.plaster : M.wood, top: M.woodDark, u0: -W / 2, o0: 0, ya: yb, u1: W / 2, o1: D, yb2: yt })
      const front = wallMat({
        w: W,
        h: FH,
        seed: o.seed * 10 + 9,
        opts: {
          timber: st.wall === "timber",
          ramp: o.ramp,
          windows: true,
          material: st.wall === "timber" ? "plaster" : st.wall,
          windowKind: st.windows,
          shutter: st.shutter,
        },
      })
      const f0 = at(-W / 2, D + 0.01),
        f1 = at(W / 2, D + 0.01)
      gb.quad({ material: front, a: [f0[0], yb, f0[1]], b: [f1[0], yb, f1[1]], c: [f1[0], yt, f1[1]], d: [f0[0], yt, f0[1]] })
      // its roof, and the brackets under it
      box({ side: M.woodDark, top: roofMat(st.roofRamp, o.seed), u0: -W / 2 - 0.08, o0: 0, ya: yt, u1: W / 2 + 0.08, o1: D + 0.1, yb2: yt + 0.09 })
      for (const u of [-W / 2 + 0.12, W / 2 - 0.12]) box({ side: M.woodDark, top: M.woodDark, u0: u - 0.05, o0: 0, ya: yb - 0.32, u1: u + 0.05, o1: D * 0.85, yb2: yb })
      oriels.push(o.name ?? "")
    }
  }
  // door step + record door point
  const du = o.door.u
  if (o.door.side === "s") {
    doorWorld[0] = x0 + du
    doorWorld[1] = z1 + 0.55
  }
  if (o.door.side === "n") {
    doorWorld[0] = x1 - du
    doorWorld[1] = z0 - 0.55
  }
  if (o.door.side === "e") {
    doorWorld[0] = x1 + 0.55
    doorWorld[1] = z1 - du
  }
  if (o.door.side === "w") {
    doorWorld[0] = x0 - 0.55
    doorWorld[1] = z0 + du
  }
  // two stone steps up to the door, set against the plinth: the upper one at the floor's height,
  // the lower one half way down to the ground
  {
    const side = o.door.side
    const nx = side === "e" ? 1 : side === "w" ? -1 : 0,
      nz = side === "s" ? 1 : side === "n" ? -1 : 0
    const face = side === "s" ? z1 + 0.06 : side === "n" ? z0 - 0.06 : side === "e" ? x1 + 0.06 : x0 - 0.06
    const along = side === "s" || side === "n" ? doorWorld[0] : doorWorld[1]
    const gy = groundH(doorWorld[0], doorWorld[1])
    const step = (inputProps: { out0: number; out1: number; top: number; half: number }) => {
      const out0 = inputProps.out0
      const out1 = inputProps.out1
      const top = inputProps.top
      const half = inputProps.half

      const a0 = face + (nx || nz) * out0,
        a1 = face + (nx || nz) * out1
      const p0State = [Math.min(a0, a1), Math.max(a0, a1)],
        p0 = p0State[0],
        p1 = p0State[1]
      if (nz) gb.box({ side: M.stone, top: M.stoneDark, x0: along - half, y0: gy - 0.3, z0: p0, x1: along + half, y1: top, z1: p1, repeat: 4 })
      else gb.box({ side: M.stone, top: M.stoneDark, x0: p0, y0: gy - 0.3, z0: along - half, x1: p1, y1: top, z1: along + half, repeat: 4 })
    }
    step({ out0: 0, out1: 0.32, top: y0 - 0.01, half: 0.5 })
    if (y0 - gy > 0.12) step({ out0: 0.32, out1: 0.6, top: gy + (y0 - gy) * 0.5, half: 0.56 })
  }

  // roof: its shape and colour are the house's own (town/style.ts)
  const span = o.axis === "x" ? z1 - z0 : x1 - x0
  const len = o.axis === "x" ? x1 - x0 : z1 - z0
  const rh = span * 0.5 * (o.roof === "thatch" ? 1.15 : 0.95) * (st.roofShape === "shed" ? 1.1 : 1)
  const ov = 0.32
  const sl = rh / (span / 2)
  const yE = y.value - ov * sl,
    yR = y.value + rh
  const rm = roofMat(st.roofRamp, o.seed)
  const gm = new THREE.MeshLambertMaterial({ map: toTex(gableTex({ w: span, h: rh, timber: st.wall === "timber", seed: o.seed, ramp: o.ramp }), false) })
  // work in the roof's own frame: u along the ridge, w across it; map back to x, z
  const P = (u: number, yy: number, w: number): [number, number, number] => (o.axis === "x" ? [x0 + u, yy, z0 + w] : [x0 + w, yy, z0 + u])
  // faces are wound to face outward in x/z; with the axis along z, u and w swap, which mirrors them
  const q = (inputProps: { a: [number, number, number]; b: [number, number, number]; c: [number, number, number]; d: [number, number, number]; m?: THREE.Material }) => {
    const a = inputProps.a
    const b = inputProps.b
    const c = inputProps.c
    const d = inputProps.d
    const m = inputProps.m === undefined ? rm : inputProps.m
    return o.axis === "x" ? gb.quad({ material: m, a: a, b: b, c: c, d: d, repeatU: 4, repeatV: 4 }) : gb.quad({ material: m, a: b, b: a, c: d, d: c, repeatU: 4, repeatV: 4 })
  }
  const t = (inputProps: { a: [number, number, number]; b: [number, number, number]; c: [number, number, number]; m: THREE.Material }) => {
    const a = inputProps.a
    const b = inputProps.b
    const c = inputProps.c
    const m = inputProps.m
    return o.axis === "x" ? gb.tri({ material: m, a: a, b: b, c: c, uvA: [0, 0], uvB: [1, 0], uvC: [0.5, 1] }) : gb.tri({ material: m, a: b, b: a, c: c, uvA: [0, 0], uvB: [1, 0], uvC: [0.5, 1] })
  }
  const L0 = -ov,
    L1 = len + ov,
    W0 = -ov,
    W1 = span + ov,
    mid = span / 2
  if (st.roofShape === "shed") {
    // one slope, from the high wall at the back (w = 0) down over the front
    const yHi = y.value + rh,
      yLo = y.value - ov * (rh / span)
    q({ a: P(L0, yLo, W1), b: P(L1, yLo, W1), c: P(L1, yHi + ov * (rh / span), W0), d: P(L0, yHi + ov * (rh / span), W0) })
    // the side walls rise to meet it
    t({ a: P(len, y.value, span), b: P(len, y.value, 0), c: P(len, yHi, 0), m: gm })
    t({ a: P(0, y.value, 0), b: P(0, y.value, span), c: P(0, yHi, 0), m: gm })
    {
      const sideMaterial = M.woodDark
      const topMaterial = M.woodDark
      const beamBounds = bboxOf(P(L0, yHi + ov * (rh / span) - 0.06, W0 - 0.04), P(L1, yHi + ov * (rh / span) + 0.06, W0 + 0.1))
      gb.box({ side: sideMaterial, top: topMaterial, x0: beamBounds[0], y0: beamBounds[1], z0: beamBounds[2], x1: beamBounds[3], y1: beamBounds[4], z1: beamBounds[5], repeat: 2 })
    }
  } else if (st.roofShape === "hip") {
    // four slopes: the ridge stops short of each end by half the span
    const r0 = Math.min(mid, len / 2 - 0.05),
      r1 = Math.max(len - mid, len / 2 + 0.05)
    q({ a: P(L0, yE, W1), b: P(L1, yE, W1), c: P(r1, yR, mid), d: P(r0, yR, mid) })
    q({ a: P(L1, yE, W0), b: P(L0, yE, W0), c: P(r0, yR, mid), d: P(r1, yR, mid) })
    t({ a: P(L1, yE, W1), b: P(L1, yE, W0), c: P(r1, yR, mid), m: rm })
    t({ a: P(L0, yE, W0), b: P(L0, yE, W1), c: P(r0, yR, mid), m: rm })
    {
      const sideMaterial2 = M.woodDark
      const topMaterial2 = M.woodDark
      const beamBounds2 = bboxOf(P(r0, yR - 0.06, mid - 0.07), P(r1, yR + 0.08, mid + 0.07))
      gb.box({ side: sideMaterial2, top: topMaterial2, x0: beamBounds2[0], y0: beamBounds2[1], z0: beamBounds2[2], x1: beamBounds2[3], y1: beamBounds2[4], z1: beamBounds2[5], repeat: 2 })
    }
  } else {
    q({ a: P(L0, yE, W1), b: P(L1, yE, W1), c: P(L1, yR, mid), d: P(L0, yR, mid) })
    q({ a: P(L1, yE, W0), b: P(L0, yE, W0), c: P(L0, yR, mid), d: P(L1, yR, mid) })
    t({ a: P(len, y.value, span), b: P(len, y.value, 0), c: P(len, yR, mid), m: gm })
    t({ a: P(0, y.value, 0), b: P(0, y.value, span), c: P(0, yR, mid), m: gm })
    // bargeboards along the gable ends, and the ridge
    for (const uu of [L0, L1]) {
      q({ a: P(uu, yE - 0.1, W1), b: P(uu, yE - 0.1, mid), c: P(uu, yR + 0.02, mid), d: P(uu, yE + 0.04, W1), m: M.woodDark })
      q({ a: P(uu, yE - 0.1, mid), b: P(uu, yE - 0.1, W0), c: P(uu, yE + 0.04, W0), d: P(uu, yR + 0.02, mid), m: M.woodDark })
    }
    {
      const sideMaterial3 = M.woodDark
      const topMaterial3 = M.woodDark
      const beamBounds3 = bboxOf(P(L0 - 0.02, yR - 0.06, mid - 0.07), P(L1 + 0.02, yR + 0.08, mid + 0.07))
      gb.box({ side: sideMaterial3, top: topMaterial3, x0: beamBounds3[0], y0: beamBounds3[1], z0: beamBounds3[2], x1: beamBounds3[3], y1: beamBounds3[4], z1: beamBounds3[5], repeat: 2 })
    }
  }
  // chimneys: where the hearth is, and a second over a work fire
  const r = new Rng(o.seed)
  for (const k = { value: 0 }; k.value < st.chimneys; k.value++) {
    const uu = len * (k.value === 0 ? 0.2 + r.next() * 0.25 : 0.65 + r.next() * 0.2)
    const ww = st.roofShape === "shed" ? span * 0.3 : mid + (r.next() < 0.5 ? -1 : 1) * span * 0.22
    const cxxState = P(uu, 0, ww),
      cxx = cxxState[0],
      czz = cxxState[2]
    const top = (st.roofShape === "shed" ? y.value + rh : yR) + 0.55 + k.value * 0.15
    const stoneish = k.value === 1 ? M.stoneDark : M.stone
    gb.box({ side: stoneish, top: M.stoneDark, x0: cxx - 0.22, y0: y.value, z0: czz - 0.22, x1: cxx + 0.22, y1: top, z1: czz + 0.22, repeat: 4 })
    gb.box({ side: M.stoneDark, top: M.stoneDark, x0: cxx - 0.27, y0: top - 0.05, z0: czz - 0.27, x1: cxx + 0.27, y1: top + 0.05, z1: czz + 0.27, repeat: 4 })
    chimneys.push(new THREE.Vector3(cxx, top + 0.1, czz))
  }
  const hg = gb.build()
  root.add(hg)
  occluder(hg, 0.22, !!o.private)
  if (o.sign) hangSign({ root: root, o: o, door: doorWorld, y0: y0 })
  blockRect({ x0: x0 - 0.1, z0: z0 - 0.1, x1: x1 + 0.1, z1: z1 + 0.1 })
  if (o.name) places[o.name] = doorWorld
  return { doorWorld, y0, top: y.value }
}
