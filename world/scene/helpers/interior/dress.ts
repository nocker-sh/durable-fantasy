import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const TALL = new Set(["shelf", "stair", "hearth", "loom", "rack", "partition"])

const rugMat2 = colorMat(0x3a4a6a)

import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"

import { hash2 } from "#/lib/engine/hash2"
import type { Interior } from "#/world/town/interiors"
import { Kit } from "#/world/scene/construction/kit"
import type { Spot, Wood } from "#/world/scene/construction/furnishings"
import { fromBeams } from "#/world/scene/construction/from-beams"
import { hang as hangOn } from "#/world/scene/construction/hang"
import { hookOf } from "#/world/scene/construction/hook-of"
import { ON_WALLS } from "#/world/scene/construction/belonging-builders"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { SIZES } from "#/world/town/fit"
import { WALL_H, rugMat, rugEdge, WALL_SCALE } from "#/world/scene/interior"
import { spotOf } from "#/world/scene/helpers/interior/spot-of"

/**
 * The walls of each ground-floor room, dressed: the plan's wall pieces first (an axe rack, herbs
 * hung to dry, the town map), then what every room of its use has, in the gaps between windows and
 * tall furniture. Then what hangs from the beams, and a rug under the table.
 */
type Props = {
  root: THREE.Group
  gb: GB
  it: Interior
  y0: number
  seed: number
  wd: Wood
}

export function dress(props: Props) {
  const plan = floorPlan(props.it.house.id)
  const K = ROOM_SCALE
  const windows = [props.it.x0 + (props.it.x1 - props.it.x0) * 0.3, props.it.x0 + (props.it.x1 - props.it.x0) * 0.7]
  const pieces = props.it.house.plan.furniture
    .filter((f) => !/（(外|2階)）$/.test(f))
    .map((f) => f.replace(/×\d+$/, ""))
    .filter((f) => SIZES[f] === "wall" && ON_WALLS[f] && f !== "大鍋")
  const wallTraces = props.it.furniture.filter((f) => f.kind === "trace" && f.z - props.it.z0 < 0.3)
  type Slot = { x: number; z: number; face: Spot["face"]; use: string; room: number }
  const slots: Slot[] = []
  plan.rooms
    .filter((r) => r.floor === 0)
    .forEach((r, ri) => {
      const rx0 = props.it.x0 + r.x0 * K,
        rx1 = props.it.x0 + r.x1 * K,
        rz0 = props.it.z0 + r.z0 * K,
        rz1 = props.it.z0 + r.z1 * K
      const walls: { a: number; b: number; at: (t: number) => [number, number]; face: Spot["face"] }[] = []
      if (r.z0 < 0.05) walls.push({ a: rx0, b: rx1, at: (t) => [t, props.it.z0], face: 0 })
      if (r.x0 < 0.05) walls.push({ a: rz0, b: rz1, at: (t) => [props.it.x0, t], face: 1 })
      if (r.x1 > plan.W - 0.05) walls.push({ a: rz0, b: rz1, at: (t) => [props.it.x1, t], face: 3 })
      for (const w of walls) {
        const n = Math.floor((w.b - w.a - 0.4) / 1.3)
        for (const i = { value: 0 }; i.value < n; i.value++) {
          const t = w.a + 0.2 + (w.b - w.a - 0.4) * ((i.value + 0.5) / n)
          const xState = w.at(t),
            x = xState[0],
            z = xState[1]
          if (w.face === 0 && windows.some((wx) => Math.abs(wx - x) < 0.75)) continue
          if (w.face !== 0 && z > props.it.z1 - 1.2) continue // too near the cut-down front
          if (wallTraces.some((f) => Math.hypot(f.x - x, f.z - z) < 0.8)) continue
          const blocked = props.it.furniture.some((f) => TALL.has(f.kind) && Math.abs(x - f.x) < f.w / 2 + 0.45 && Math.abs(z - f.z) < f.d / 2 + 0.45)
          if (!blocked) slots.push({ x, z, face: w.face, use: r.use, room: ri })
        }
      }
    })
  // the plan's own wall pieces go to work rooms first, then anywhere
  const order = [...slots].sort((a, b) => Number(!/作業場|売り場|土間|貯蔵/.test(a.use)) - Number(!/作業場|売り場|土間|貯蔵/.test(b.use)))
  const taken = new Set<Slot>()
  for (const entry of pieces.entries()) {
    const i = entry[0]
    const piece = entry[1]

    const s = order.find((x) => !taken.has(x))
    if (!s) break
    taken.add(s)
    const hook = hookOf(piece)
    hangOn({ k: new Kit(props.gb, { x: s.x, z: s.z, w: 1, d: 0.2, y: props.y0 + hook, face: s.face }, WALL_SCALE), wd: props.wd, what: { piece }, seed: props.seed + i * 17 })
  }
  slots.forEach((s, i) => {
    if (taken.has(s) || hash2(props.seed, i, 91) < 0.25) return
    hangOn({ k: new Kit(props.gb, { x: s.x, z: s.z, w: 1, d: 0.2, y: props.y0 + 1.5, face: s.face }, WALL_SCALE), wd: props.wd, what: { use: s.use }, seed: props.seed + i * 29 })
  })
  // the beams, and rugs where people sit
  plan.rooms
    .filter((r) => r.floor === 0)
    .forEach((r, ri) => {
      const cx = props.it.x0 + ((r.x0 + r.x1) / 2) * K,
        z = props.it.z0 + r.z0 * K + 0.5
      if (/台所|貯蔵|作業場|食事|住まい/.test(r.use) && hash2(props.seed, ri, 93) > 0.3)
        fromBeams({
          k: new Kit(props.gb, { x: cx, z, w: 1, d: 0.2, y: props.y0 + WALL_H - 0.05, face: 0 }, WALL_SCALE),
          use: r.use,
          seed: props.seed + ri,
          apothecary: props.it.house.shop === "apothecary",
        })
    })
  for (const f of props.it.furniture) {
    if (!/^(食卓|大きな食卓|長卓|卓)$/.test(f.name ?? "") && f.kind !== "hearth") continue
    const rg = new GB()
    const s = spotOf(props.it, f, props.y0)
    const wState = f.kind === "hearth" ? [Math.min(f.w, f.d) * 0.9, 0.9] : [s.w + 1.0, s.d + 1.0],
      w = wState[0],
      d = wState[1]
    const front = f.kind === "hearth" ? new Kit(rg, s).at(0, (s.face === 1 || s.face === 3 ? s.w : s.d) / 2 + 0.55) : [s.x, s.z]
    const rot = f.kind === "hearth" && (s.face === 1 || s.face === 3)
    const rwState = rot ? [d, w] : [w, d],
      rw = rwState[0],
      rd = rwState[1]
    rg.box({ side: rugEdge, top: rugEdge, x0: front[0] - rw / 2, y0: props.y0, z0: front[1] - rd / 2, x1: front[0] + rw / 2, y1: props.y0 + 0.008, z1: front[1] + rd / 2, repeat: 2 })
    const rm = hash2(props.seed, Math.round(f.x * 10), 95) > 0.5 ? rugMat : rugMat2
    rg.box({
      side: rm,
      top: rm,
      x0: front[0] - rw / 2 + 0.08,
      y0: props.y0 + 0.008,
      z0: front[1] - rd / 2 + 0.08,
      x1: front[0] + rw / 2 - 0.08,
      y1: props.y0 + 0.012,
      z1: front[1] + rd / 2 - 0.08,
      repeat: 2,
    })
    props.root.add(rg.build(false))
  }
}
