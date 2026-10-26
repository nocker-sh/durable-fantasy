import * as THREE from "three"
import { GB, toTex } from "../gfx"
import { Rng } from "../pix"
import { ashlarTex } from "../textures"
import { groundH, blockRect, blockCircle, currentLayout } from "../world"
import { M } from "./materials.ts"
import { glowify } from "./houses.ts"
import { occluder, animateObject, places } from "./registry.ts"
import { fence } from "./fences.ts"

// ---------------------------------------------------------------- chapel
export function chapel(root: THREE.Group) {
  const gb = new GB()
  const x0 = 8,
    x1 = 15,
    z0 = 3,
    z1 = 7
  const y0 = groundH(11, 5) + 0.05,
    H = 3.4
  gb.box(M.stoneDark, M.ashlar, x0 - 0.1, y0 - 0.5, z0 - 0.1, x1 + 0.1, y0 + 0.15, z1 + 0.1, 4)
  const yb = y0 + 0.15,
    yt = yb + H
  const mk = (w: number, l: number[], door?: number, rose = false, seed = 9) => {
    const [b, g] = ashlarTex(w, H, l, door, rose, seed)
    return glowify(new THREE.MeshLambertMaterial({ map: toTex(b, false) }), g)
  }
  const sM = mk(x1 - x0, [1.2, 2.8, 4.4, 6], 3.6),
    nM = mk(x1 - x0, [1.2, 2.8, 4.4, 6], undefined, false, 11)
  const eM = mk(z1 - z0, [], undefined, true, 12),
    wM = mk(z1 - z0, [2], undefined, false, 13)
  gb.quad(sM, [x0, yb, z1], [x1, yb, z1], [x1, yt, z1], [x0, yt, z1])
  gb.quad(nM, [x1, yb, z0], [x0, yb, z0], [x0, yt, z0], [x1, yt, z0])
  gb.quad(eM, [x1, yb, z1], [x1, yb, z0], [x1, yt, z0], [x1, yt, z1])
  gb.quad(wM, [x0, yb, z0], [x0, yb, z1], [x0, yt, z1], [x0, yt, z0])
  // buttresses
  for (const x of [x0 + 0.1, x0 + 2.4, x0 + 4.6, x1 - 0.1])
    for (const z of [z0 - 0.35, z1]) {
      gb.box(M.ashlar, M.ashlar, x - 0.2, yb - 0.3, z, x + 0.2, yt - 0.9, z + 0.35, 4)
    }
  const cz = (z0 + z1) / 2,
    rh = 2.3,
    ov = 0.25,
    yE = yt - ov * (rh / 2),
    yR = yt + rh
  gb.quad(M.slate, [x0 - ov, yE, z1 + ov], [x1 + ov, yE, z1 + ov], [x1 + ov, yR, cz], [x0 - ov, yR, cz], 4, 4)
  gb.quad(M.slate, [x1 + ov, yE, z0 - ov], [x0 - ov, yE, z0 - ov], [x0 - ov, yR, cz], [x1 + ov, yR, cz], 4, 4)
  gb.tri(M.ashlar, [x1, yt, z1], [x1, yt, z0], [x1, yR, cz], [0, 0], [1, 0], [0.5, 0.6])
  gb.tri(M.ashlar, [x0, yt, z0], [x0, yt, z1], [x0, yR, cz], [0, 0], [1, 0], [0.5, 0.6])
  // bell tower at west end
  const tx0 = 5.6,
    tx1 = 8,
    tz0 = 3.8,
    tz1 = 6.2,
    th = 6.2
  gb.box(M.ashlar, null, tx0, y0 - 0.5, tz0, tx1, yb + th, tz1, 4)
  // belfry openings: dark insets
  for (const [a, b2, c, d] of [
    [tx0 + 0.7, tz1 + 0.01, tx1 - 0.7, tz1 + 0.02],
    [tx0 + 0.7, tz0 - 0.02, tx1 - 0.7, tz0 - 0.01],
  ] as number[][])
    gb.box(M.dark, null, a, yb + th - 1.5, b2, c, yb + th - 0.4, d, 2)
  for (const [a, b2, c, d] of [
    [tx0 - 0.02, tz0 + 0.7, tx0 - 0.01, tz1 - 0.7],
    [tx1 + 0.01, tz0 + 0.7, tx1 + 0.02, tz1 - 0.7],
  ] as number[][])
    gb.box(M.dark, null, a, yb + th - 1.5, b2, c, yb + th - 0.4, d, 2)
  gb.box(M.ashlar, M.ashlar, tx0 - 0.12, yb + th, tz0 - 0.12, tx1 + 0.12, yb + th + 0.2, tz1 + 0.12, 4)
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
    const [ax, az] = pts[i],
      [bx, bz] = pts[(i + 1) % 4]
    gb.tri(M.slate, [ax, sy, az], [bx, sy, bz], [mx, sy + sp, mz], [0, 0], [0.6, 0], [0.3, 0.85])
  }
  const cg = gb.build()
  root.add(cg)
  occluder(cg)
  // cross
  const c = new GB()
  c.box(M.iron, M.iron, mx - 0.03, sy + sp, mz - 0.03, mx + 0.03, sy + sp + 0.6, mz + 0.03, 1)
  c.box(M.iron, M.iron, mx - 0.03, sy + sp + 0.35, mz - 0.2, mx + 0.03, sy + sp + 0.41, mz + 0.2, 1)
  root.add(c.build())
  // bell
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.38, 0.6, 10), new THREE.MeshLambertMaterial({ color: 0x9a7a3a }))
  bell.position.set(mx, yb + th - 0.9, mz)
  root.add(bell)
  animateObject(bell, (t) => {
    bell.rotation.x = Math.sin(t * 0.7) * Math.max(0, Math.sin(t * 0.05)) * 0.35
  })
  blockRect(x0 - 0.5, z0 - 0.5, x1 + 0.2, z1 + 0.4)
  blockRect(tx0 - 0.2, tz0 - 0.2, tx1, tz1 + 0.2)
  places.chapelDoor = [x0 + 3.6, z1 + 0.8]
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
        g2.box(M.stone, M.stone, xx - 0.17, yy - 0.1, zz - 0.05, xx + 0.17, yy + 0.42, zz + 0.05, 2)
      } else {
        g2.box(M.woodDark, M.woodDark, xx - 0.03, yy - 0.1, zz - 0.03, xx + 0.03, yy + 0.55, zz + 0.03, 2)
        g2.box(M.woodDark, M.woodDark, xx - 0.17, yy + 0.33, zz - 0.03, xx + 0.17, yy + 0.39, zz + 0.03, 2)
      }
      g2.box(M.leaf2, null, xx - 0.2, yy - 0.05, zz + 0.08, xx + 0.2, yy + 0.02, zz + 0.6, 2)
      blockCircle(xx, zz + 0.2, 0.3)
    }
  root.add(g2.build())
  fence(
    root,
    [
      [G.x0, G.z0],
      [G.x1, G.z0],
      [G.x1, G.z1],
      [G.x0, G.z1],
      [G.x0, G.z0],
    ],
    [[G.x1 - 0.2, (G.z0 + G.z1) / 2]],
    0.6,
  )
  places.graveyard = [G.x1 + 0.6, (G.z0 + G.z1) / 2]
}
