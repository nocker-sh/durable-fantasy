import * as THREE from "three"

import type { V2 } from "#/world/scene/construction/registry"

import type { Side } from "#/world/scene/dressing"
const SIDES_BY_DOOR: Record<Side, Side[]> = { s: ["e", "w", "n", "s"], n: ["w", "e", "s", "n"], e: ["n", "s", "w", "e"], w: ["s", "n", "e", "w"] }

import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { barrel } from "#/world/scene/construction/barrel"
import { bucket } from "#/world/scene/construction/bucket"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { woodpile } from "#/world/scene/construction/woodpile"
import { addSprite } from "#/world/scene/construction/add-sprite"

import { hanging } from "#/world/scene/hanging"
import { GPPU } from "#/world/scene/goods"
import { Rng } from "#/lib/engine/random"
import { groundH } from "#/world/scene/ground-h"
import { isFree } from "#/world/scene/is-free"
import { thingsFor } from "#/world/scene/props/catalog"
import { HOUSEHOLDS } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"

import { OUT, placed } from "#/world/scene/dressing"
import { doorPoint } from "#/world/scene/helpers/dressing/door-point"
import { along } from "#/world/scene/helpers/dressing/along"
import { clear } from "#/world/scene/helpers/dressing/clear"
import { firstClear } from "#/world/scene/helpers/dressing/first-clear"
import { flowerPot } from "#/world/scene/flower-pot"
import { netFrame } from "#/world/scene/net-frame"
import { hideFrame } from "#/world/scene/hide-frame"
import { wheel } from "#/world/scene/wheel"
import { choppingBlock } from "#/world/scene/chopping-block"
import { spearRack } from "#/world/scene/spear-rack"
import { planks } from "#/world/scene/planks"
import { woolSacks } from "#/world/scene/wool-sacks"
import { rentSign } from "#/world/scene/rent-sign"
import { doorPath } from "#/world/scene/helpers/dressing/door-path"
import { backYard } from "#/world/scene/helpers/dressing/back-yard"
import { kitchenBed } from "#/world/scene/helpers/dressing/kitchen-bed"
import { placeThing } from "#/world/scene/helpers/dressing/place-thing"

// ---------------------------------------------------------------- per house

export function dress(root: THREE.Group, gb: GB, h: HouseDef) {
  const r = new Rng(h.seed * 31 + 7)
  const hh = HOUSEHOLDS.find((x) => x.id === h.household)
  const sides = SIDES_BY_DOOR[h.door.side]
  const door = doorPoint(h)
  const put = (inputProps: { rad: number; tryAt: (side: Side) => V2[]; draw: (p: V2, side: Side) => void; from?: number }) => {
    const rad = inputProps.rad
    const tryAt = inputProps.tryAt
    const draw = inputProps.draw
    const from = inputProps.from === undefined ? 0 : inputProps.from

    for (const side of sides.slice(from)) {
      const p = firstClear(h, tryAt(side), rad)
      if (p) {
        draw(p, side)
        placed.push(h.id)
        return true
      }
    }
    return false
  }

  if (h.kind === "vacant") {
    const p = firstClear(
      h,
      [
        [door[0] + 0.9, door[1]],
        [door[0] - 0.9, door[1]],
        [door[0], door[1] + 0.9],
      ],
      0.2,
    )
    if (p) rentSign(root, p[0], p[1])
    for (const id of thingsFor(undefined, undefined, true)) placeThing({ root: root, gb: gb, h: h, id: id, side: sides[1], r: r })
    return
  }
  if (!hh || !h.plan.hearth) return

  backYard(root, h)
  // fuel for the hearth: more wood for a bigger, better-off house
  const len = hh.living === "ゆとりがある" ? 1.6 : hh.living === "ふつう" ? 1.2 : 0.9
  put({
    rad: 0.6,
    tryAt: (s) => along({ h: h, side: s, off: 0.95, step: 0.4 }),
    draw: (p, s) => woodpile({ gb: gb, x: p[0], z: p[1], len: len, layers: hh.living === "慎ましい" ? 2 : 3, alongX: s === "n" || s === "s" }),
  })
  // a bucket by the door: water from the well
  const bx = door[0] + (h.door.side === "n" || h.door.side === "s" ? 0.75 : 0) + OUT[h.door.side][0] * -0.1
  const bz = door[1] + (h.door.side === "e" || h.door.side === "w" ? 0.75 : 0) + OUT[h.door.side][1] * -0.1
  if (isFree(bx, bz)) bucket({ gb: gb, x: bx, z: bz })
  // flowers in pots by the door where there is time and money for them
  if (hh.living === "ゆとりがある" || hh.id === "elder" || hh.id === "priest") {
    for (const k of [-1, 1]) {
      const oxState = h.door.side === "n" || h.door.side === "s" ? [k * 1.0, 0] : [0, k * 1.0],
        ox = oxState[0],
        oz = oxState[1]
      const px = door[0] + ox,
        pz = door[1] + oz
      if (isFree(px, pz) && clear(h, [px, pz], 0.1)) flowerPot({ gb: gb, root: root, x: px, z: pz, seed: h.seed + k })
    }
  }
  // the trade
  const t = hh.id
  if (t === "fisher") put({ rad: 0.9, tryAt: (s) => along({ h: h, side: s, off: 1.1, step: 0.5 }), draw: (p, s) => netFrame({ gb: gb, x: p[0], z: p[1], alongX: s === "n" || s === "s" }), from: 1 })
  if (t === "carter") put({ rad: 0.45, tryAt: (s) => along({ h: h, side: s, off: 0.6 }), draw: (p) => wheel(gb, p[0], p[1]), from: 1 })
  if (t === "woodcutter") put({ rad: 0.35, tryAt: (s) => along({ h: h, side: s, off: 0.9 }), draw: (p) => choppingBlock(gb, p[0], p[1]), from: 1 })
  if (t === "shepherd") put({ rad: 0.45, tryAt: (s) => along({ h: h, side: s, off: 0.75 }), draw: (p) => woolSacks(gb, p[0], p[1]), from: 1 })
  if (t === "leather") put({ rad: 0.6, tryAt: (s) => along({ h: h, side: s, off: 0.8 }), draw: (p) => hideFrame(gb, p[0], p[1]), from: 1 })
  if (t === "woodworker") put({ rad: 0.95, tryAt: (s) => along({ h: h, side: s, off: 0.8, step: 0.4 }), draw: (p, s) => planks({ gb: gb, x: p[0], z: p[1], alongX: s === "n" || s === "s" }), from: 1 })
  if (t === "guards") put({ rad: 0.6, tryAt: (s) => along({ h: h, side: s, off: 0.7 }), draw: (p) => spearRack(gb, p[0], p[1]), from: 0 })
  if (t === "tavern" || t === "inn")
    put({
      rad: 0.5,
      tryAt: (s) => along({ h: h, side: s, off: 0.75 }),
      draw: (p) => {
        barrel({ gb: gb, x: p[0], z: p[1] })
        barrel({ gb: gb, x: p[0] + 0.45, z: p[1] + 0.2, h: 0.6, r: 0.25 })
      },
      from: 1,
    })
  if (t === "buyer" || t === "warehouse" || t === "general")
    put({
      rad: 0.5,
      tryAt: (s) => along({ h: h, side: s, off: 0.75 }),
      draw: (p) => {
        crate({ gb: gb, x: p[0], z: p[1], s: 0.5 })
        crate({ gb: gb, x: p[0], z: p[1], s: 0.38, y: groundH(p[0], p[1]) + 0.4 })
        sack({ gb: gb, x: p[0] + 0.45, z: p[1] })
      },
      from: 1,
    })
  if (t === "bakers")
    put({
      rad: 0.4,
      tryAt: (s) => along({ h: h, side: s, off: 0.7 }),
      draw: (p) => {
        sack({ gb: gb, x: p[0], z: p[1] })
        sack({ gb: gb, x: p[0] + 0.3, z: p[1] + 0.15 })
      },
      from: 1,
    })
  if (t === "apothecary")
    put({
      rad: 0.4,
      tryAt: (s) => along({ h: h, side: s, off: 0.45 }),
      draw: (p) => {
        // herbs hung under the eaves to dry
        const g = new THREE.Group()
        g.position.set(p[0], 0, p[1])
        root.add(g)
        for (const k = { value: 0 }; k.value < 3; k.value++) addSprite({ root: g, b: hanging("herb", h.seed + k.value), x: (k.value - 1) * 0.35, y: groundH(p[0], p[1]) + 1.9 - 34 / GPPU, z: 0 })
      },
      from: 0,
    })
  // a bed of vegetables at the back or the side, for any household with the ground for it
  const bed = (from: number) =>
    put({
      rad: 0.85,
      tryAt: (s) => along({ h: h, side: s, off: 1.15, step: 0.5 }),
      draw: (p, s) => {
        kitchenBed({ gb: gb, root: root, x: p[0], z: p[1], alongX: s === "n" || s === "s", seed: h.seed })
        placed.push(`${h.id}:kitchen-bed`)
      },
      from: from,
    })
  if (!bed(2)) bed(0)
  // the small things of everyday life along the walls: ash brooms, lidded water, kindling, a stool, a cat
  for (const entry of thingsFor(hh.id, hh.living, false).entries()) {
    const k = entry[0]
    const id = entry[1]
    placeThing({ root: root, gb: gb, h: h, id: id, side: sides[(k + 1) % 4], r: r })
  }
  if (t === "farm" && h.kind === "home")
    put({
      rad: 0.4,
      tryAt: (s) => along({ h: h, side: s, off: 0.7 }),
      draw: (p) => {
        sack({ gb: gb, x: p[0], z: p[1] })
        flowerPot({ gb: gb, root: root, x: p[0] + 0.4, z: p[1], seed: h.seed })
      },
      from: 1,
    })
  // last, so the stones go round whatever now stands by the house
  doorPath(gb, h)
  void r
}
