import * as THREE from "three"

import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import type { V2 } from "#/world/scene/construction/registry"

import type { ShopKind } from "#/world/core/shop-types"
const SET_OUT: Partial<Record<string, string[]>> = { tavern: ["jug", "jug"], inn: ["jug"], apothecary: ["herb", "herb", "herb"], bakery: ["bread", "roll", "bread"] }

const AWNING: Record<ShopKind, [string, string]> = {
  food: ["cMustard", "cLinen"],
  inn: ["cWine", "cLinen"],
  weapon: ["cGray", "cLinen"],
  armor: ["cBrown", "cLinen"],
  tools: ["cGreen", "cLinen"],
  medicine: ["cGreen", "cCream"],
  crystal: ["cBlue", "cLinen"],
  tailor: ["cRed", "cCream"],
  buyer: ["cBrown", "cCream"],
}

import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"

import { M } from "#/world/scene/construction/materials"
import { bench } from "#/world/scene/construction/bench"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { movingObjects } from "#/world/scene/construction/registry"

import { basket } from "#/world/scene/basket"
import { clothStripeTex } from "#/world/scene/textures/cloth-stripe-tex"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"
import type { HouseDef } from "#/world/town/house-types"
import { SHOPS } from "#/world/core/shops"
import { OUT, shopBoards, placed } from "#/world/scene/dressing"
import { doorPoint } from "#/world/scene/helpers/dressing/door-point"
import { clear } from "#/world/scene/helpers/dressing/clear"
import { signWord } from "#/world/scene/helpers/dressing/sign-word"
import { signTex } from "#/world/scene/helpers/dressing/sign-tex"

/**
 * The front of a shop: a striped awning over the door, a sign hung out on an iron arm so it is read
 * from along the street, and, where the wares can be drawn, a bench of them by the door while it is open.
 */
export function shopFront(root: THREE.Group, gb: GB, h: HouseDef) {
  const def = h.shop ? SHOPS[h.shop as keyof typeof SHOPS] : undefined
  if (!def) return
  const dxState = doorPoint(h),
    dx = dxState[0],
    dz = dxState[1]
  const oxState = OUT[h.door.side],
    ox = oxState[0],
    oz = oxState[1]
  // along the wall, and the wall's face (the door point is half a tile out)
  const axState = [-oz, ox],
    ax = axState[0],
    az = axState[1]
  const wx = dx - ox * 0.5,
    wz = dz - oz * 0.5
  const y = groundH(dx, dz)
  // the awning: from the wall above the door, sloping down and out
  const s1State = AWNING[def.kind],
    s1 = s1State[0],
    s2 = s1State[1]
  const cloth = mat(clothStripeTex(s1, s2, h.seed), { alpha: true, side: THREE.DoubleSide })
  const half = 0.95
  const at = (u: number, out: number, up: number): [number, number, number] => [wx + ax * u + ox * out, y + up, wz + az * u + oz * out]
  gb.quad({ material: cloth, a: at(-half, 0.02, 2.05), b: at(half, 0.02, 2.05), c: at(half, 0.85, 1.72), d: at(-half, 0.85, 1.72), repeatU: 0.5, repeatV: 0 })
  for (const u of [-half, half]) {
    const bxState = at(u, 0.45, 1.86),
      bx = bxState[0],
      by = bxState[1],
      bz = bxState[2]
    gb.box({ side: M.iron, top: null, x0: bx - 0.02, y0: by - 0.02, z0: bz - 0.02, x1: bx + 0.02, y1: by + 0.02, z1: bz + 0.02, repeat: 1 })
  }
  // the sign: an iron arm out from the wall beside the door, a board under it facing along the street
  const side = 1.45
  const pxState = at(-side, 0, 2.25),
    px = pxState[0],
    py = pxState[1],
    pz = pxState[2]
  const exState = at(-side, 0.75, 2.25),
    ex = exState[0],
    ez = exState[2]
  gb.box({ side: M.iron, top: null, x0: Math.min(px, ex) - 0.025, y0: py, z0: Math.min(pz, ez) - 0.025, x1: Math.max(px, ex) + 0.025, y1: py + 0.05, z1: Math.max(pz, ez) + 0.025, repeat: 1 })
  const tex = new THREE.MeshLambertMaterial({ map: signTex(signWord(h.shop!, def.kind)) })
  for (const flip of [0, Math.PI]) {
    const board = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.34), tex)
    const cxState = at(-side, 0.45, 1.98),
      cx = cxState[0],
      cy = cxState[1],
      cz = cxState[2]
    board.position.set(cx + ax * (flip ? -0.015 : 0.015), cy, cz + az * (flip ? -0.015 : 0.015))
    board.rotation.y = Math.atan2(ax, az) + flip
    root.add(board)
  }
  // the wares: on a bench on the other side of the door, set out only while the shop is open
  const goods = SET_OUT[h.shop!]
  if (!goods) return
  const bxState2: V2 = [dx + ax * 1.15 - ox * 0.1, dz + az * 1.15 - oz * 0.1],
    bx = bxState2[0],
    bz = bxState2[1]
  if (!clear(h, [bx, bz], 0.35)) return
  const wares = new THREE.Group()
  const wb = new GB()
  const alongX = Math.abs(ax) > 0.5
  bench({ gb: wb, x: bx, z: bz, w: 0.9, alongX: alongX })
  wares.add(wb.build())
  goods.forEach((g, i) => {
    const t = (i - (goods.length - 1) / 2) * 0.28
    addSprite({ root: wares, b: basket({ kind: g, seed: h.seed + i, w: 16, h: 14 }), x: bx + ax * t, y: groundH(bx, bz) + 0.42, z: bz + az * t })
  })
  blockRect({ x0: bx - (alongX ? 0.5 : 0.2), z0: bz - (alongX ? 0.2 : 0.5), x1: bx + (alongX ? 0.5 : 0.2), z1: bz + (alongX ? 0.2 : 0.5) })
  root.add(wares)
  movingObjects.add(wares)
  const board = shopBoards.find((b) => b.shop === h.shop)
  if (board) board.wares = wares
  placed.push(`${h.id}:shop-front`)
}
