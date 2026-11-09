import { CHAPEL } from "#/world/town/chapel"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { Rng } from "#/lib/engine/random"
import { ashlarTex } from "#/world/scene/textures/ashlar-tex"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { blockCircle } from "#/world/scene/block-circle"
import { currentLayout } from "#/world/scene/current-layout"
import { M } from "#/world/scene/construction/materials"
import { glowify } from "#/world/scene/construction/helpers/houses/glowify"
import { occluder } from "#/world/scene/construction/occluder"
import { animateObject } from "#/world/scene/construction/animate-object"
import { places } from "#/world/scene/construction/registry"
import { fence } from "#/world/scene/construction/fence"

// ---------------------------------------------------------------- chapel
export function chapel(root: THREE.Group) {
  const gb = new GB()
  const x0Source = CHAPEL.body,
    x0 = x0Source.x0,
    x1 = x0Source.x1,
    z0 = x0Source.z0,
    z1 = x0Source.z1,
    H = x0Source.height
  const y0 = groundH(11, 5) + 0.05
  gb.box({ side: M.stoneDark, top: M.ashlar, x0: x0 - CHAPEL.baseMargin, y0: y0 - 0.5, z0: z0 - CHAPEL.baseMargin, x1: x1 + CHAPEL.baseMargin, y1: y0 + 0.15, z1: z1 + CHAPEL.baseMargin, repeat: 4 })
  const yb = y0 + 0.15,
    yt = yb + H
  const mk = (inputProps: { w: number; l: number[]; door?: number; rose?: boolean; seed?: number }) => {
    const w = inputProps.w
    const l = inputProps.l
    const door = inputProps.door
    const rose = inputProps.rose === undefined ? false : inputProps.rose
    const seed = inputProps.seed === undefined ? 9 : inputProps.seed

    const bState = ashlarTex({ w: w, h: H, lancets: l, door: door, rose: rose, seed: seed }),
      b = bState[0],
      g = bState[1]
    return glowify(new THREE.MeshLambertMaterial({ map: toTex(b, false) }), g)
  }
  const sM = mk({ w: x1 - x0, l: [1.2, 2.8, 4.4, 6], door: CHAPEL.doorOffset }),
    nM = mk({ w: x1 - x0, l: [1.2, 2.8, 4.4, 6], door: undefined, rose: false, seed: 11 })
  const eM = mk({ w: z1 - z0, l: [], door: undefined, rose: true, seed: 12 }),
    wM = mk({ w: z1 - z0, l: [2], door: undefined, rose: false, seed: 13 })
  gb.quad({ material: sM, a: [x0, yb, z1], b: [x1, yb, z1], c: [x1, yt, z1], d: [x0, yt, z1] })
  gb.quad({ material: nM, a: [x1, yb, z0], b: [x0, yb, z0], c: [x0, yt, z0], d: [x1, yt, z0] })
  gb.quad({ material: eM, a: [x1, yb, z1], b: [x1, yb, z0], c: [x1, yt, z0], d: [x1, yt, z1] })
  gb.quad({ material: wM, a: [x0, yb, z0], b: [x0, yb, z1], c: [x0, yt, z1], d: [x0, yt, z0] })
  // buttresses
  for (const x of [x0 + 0.1, x0 + 2.4, x0 + 4.6, x1 - 0.1])
    for (const z of [z0 - CHAPEL.buttressDepth, z1]) {
      gb.box({ side: M.ashlar, top: M.ashlar, x0: x - 0.2, y0: yb - 0.3, z0: z, x1: x + 0.2, y1: yt - 0.9, z1: z + CHAPEL.buttressDepth, repeat: 4 })
    }
  const cz = (z0 + z1) / 2,
    rh = 2.3,
    ov = CHAPEL.roofOverhang,
    yE = yt - ov * (rh / 2),
    yR = yt + rh
  gb.quad({ material: M.slate, a: [x0 - ov, yE, z1 + ov], b: [x1 + ov, yE, z1 + ov], c: [x1 + ov, yR, cz], d: [x0 - ov, yR, cz], repeatU: 4, repeatV: 4 })
  gb.quad({ material: M.slate, a: [x1 + ov, yE, z0 - ov], b: [x0 - ov, yE, z0 - ov], c: [x0 - ov, yR, cz], d: [x1 + ov, yR, cz], repeatU: 4, repeatV: 4 })
  gb.tri({ material: M.ashlar, a: [x1, yt, z1], b: [x1, yt, z0], c: [x1, yR, cz], uvA: [0, 0], uvB: [1, 0], uvC: [0.5, 0.6] })
  gb.tri({ material: M.ashlar, a: [x0, yt, z0], b: [x0, yt, z1], c: [x0, yR, cz], uvA: [0, 0], uvB: [1, 0], uvC: [0.5, 0.6] })
  // bell tower at west end
  const tx0Source = CHAPEL.tower,
    tx0 = tx0Source.x0,
    tx1 = tx0Source.x1,
    tz0 = tx0Source.z0,
    tz1 = tx0Source.z1,
    th = tx0Source.height
  gb.box({ side: M.ashlar, top: null, x0: tx0, y0: y0 - 0.5, z0: tz0, x1: tx1, y1: yb + th, z1: tz1, repeat: 4 })
  // belfry openings: dark insets
  for (const entry of [
    [tx0 + 0.7, tz1 + 0.01, tx1 - 0.7, tz1 + 0.02],
    [tx0 + 0.7, tz0 - 0.02, tx1 - 0.7, tz0 - 0.01],
  ] as number[][]) {
    const a = entry[0]
    const b2 = entry[1]
    const c = entry[2]
    const d = entry[3]
    gb.box({ side: M.dark, top: null, x0: a, y0: yb + th - 1.5, z0: b2, x1: c, y1: yb + th - 0.4, z1: d, repeat: 2 })
  }
  for (const entry2 of [
    [tx0 - 0.02, tz0 + 0.7, tx0 - 0.01, tz1 - 0.7],
    [tx1 + 0.01, tz0 + 0.7, tx1 + 0.02, tz1 - 0.7],
  ] as number[][]) {
    const a = entry2[0]
    const b2 = entry2[1]
    const c = entry2[2]
    const d = entry2[3]
    gb.box({ side: M.dark, top: null, x0: a, y0: yb + th - 1.5, z0: b2, x1: c, y1: yb + th - 0.4, z1: d, repeat: 2 })
  }
  gb.box({
    side: M.ashlar,
    top: M.ashlar,
    x0: tx0 - CHAPEL.tower.capOverhang,
    y0: yb + th,
    z0: tz0 - CHAPEL.tower.capOverhang,
    x1: tx1 + CHAPEL.tower.capOverhang,
    y1: yb + th + 0.2,
    z1: tz1 + CHAPEL.tower.capOverhang,
    repeat: 4,
  })
  const sy = yb + th + 0.2,
    sp = 3.4,
    mx = (tx0 + tx1) / 2,
    mz = (tz0 + tz1) / 2
  const pts: [number, number][] = [
    [tx0 - 0.1, tz1 + 0.1],
    [tx1 + 0.1, tz1 + 0.1],
    [tx1 + 0.1, tz0 - 0.1],
    [tx0 - 0.1, tz0 - 0.1],
  ]
  for (let i = 0; i < 4; i++) {
    const axState = pts[i],
      ax = axState[0],
      az = axState[1],
      bxState = pts[(i + 1) % 4],
      bx = bxState[0],
      bz = bxState[1]
    gb.tri({ material: M.slate, a: [ax, sy, az], b: [bx, sy, bz], c: [mx, sy + sp, mz], uvA: [0, 0], uvB: [0.6, 0], uvC: [0.3, 0.85] })
  }
  const cg = gb.build()
  root.add(cg)
  occluder(cg)
  // cross
  const c = new GB()
  c.box({ side: M.iron, top: M.iron, x0: mx - 0.03, y0: sy + sp, z0: mz - 0.03, x1: mx + 0.03, y1: sy + sp + 0.6, z1: mz + 0.03, repeat: 1 })
  c.box({ side: M.iron, top: M.iron, x0: mx - 0.03, y0: sy + sp + 0.35, z0: mz - 0.2, x1: mx + 0.03, y1: sy + sp + 0.41, z1: mz + 0.2, repeat: 1 })
  root.add(c.build())
  // bell
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.38, 0.6, 10), new THREE.MeshLambertMaterial({ color: 0x9a7a3a }))
  bell.position.set(mx, yb + th - 0.9, mz)
  root.add(bell)
  animateObject(bell, (t) => {
    bell.rotation.x = Math.sin(t * 0.7) * Math.max(0, Math.sin(t * 0.05)) * 0.35
  })
  blockRect({ x0: x0 - 0.5, z0: z0 - 0.5, x1: x1 + 0.2, z1: z1 + 0.4 })
  blockRect({ x0: tx0 - 0.2, z0: tz0 - 0.2, x1: tx1, z1: tz1 + 0.2 })
  places.chapelDoor = [x0 + CHAPEL.doorOffset, z1 + CHAPEL.approachOffset]
  // graveyard
  const g2 = new GB()
  const G = currentLayout().graveyard
  const r = new Rng(77)
  for (let z = G.z0 + 0.6; z < G.z1 - 0.3; z += 1.0)
    for (let x = G.x0 + 0.5; x < G.x1 - 0.3; x += 0.9) {
      if (r.next() < 0.25) continue
      const xx = x + (r.next() - 0.5) * 0.2,
        zz = z + (r.next() - 0.5) * 0.2,
        yy = groundH(xx, zz)
      if (r.next() < 0.5) {
        g2.box({ side: M.stone, top: M.stone, x0: xx - 0.17, y0: yy - 0.1, z0: zz - 0.05, x1: xx + 0.17, y1: yy + 0.42, z1: zz + 0.05, repeat: 2 })
      } else {
        g2.box({ side: M.woodDark, top: M.woodDark, x0: xx - 0.03, y0: yy - 0.1, z0: zz - 0.03, x1: xx + 0.03, y1: yy + 0.55, z1: zz + 0.03, repeat: 2 })
        g2.box({ side: M.woodDark, top: M.woodDark, x0: xx - 0.17, y0: yy + 0.33, z0: zz - 0.03, x1: xx + 0.17, y1: yy + 0.39, z1: zz + 0.03, repeat: 2 })
      }
      g2.box({ side: M.leaf2, top: null, x0: xx - 0.2, y0: yy - 0.05, z0: zz + 0.08, x1: xx + 0.2, y1: yy + 0.02, z1: zz + 0.6, repeat: 2 })
      blockCircle(xx, zz + 0.2, 0.3)
    }
  root.add(g2.build())
  fence({
    root: root,
    pts: [
      [G.x0, G.z0],
      [G.x1, G.z0],
      [G.x1, G.z1],
      [G.x0, G.z1],
      [G.x0, G.z0],
    ],
    gaps: [[G.x1 - 0.2, (G.z0 + G.z1) / 2]],
    h: 0.6,
  })
  places.graveyard = [G.x1 + 0.6, (G.z0 + G.z1) / 2]
}
