import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
const BLUSH = hex("#e89c8c")

const PITCH = 0.36

const NB4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const
import { appendPrimitives } from "#/lib/graphics/ray/append-primitives"
import { getPaddedFrameLayout } from "#/lib/graphics/get-padded-frame-layout"
import type { Skel } from "#/world/scene/rig"
import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { RAMPS, OUTLINE } from "#/world/scene/pix"
import type { RGB } from "#/lib/graphics/pixel-types"
import type { Look, Item } from "#/world/scene/figure/look"
import { buildBody } from "#/world/scene/figure/body"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { crossVector3 as cross } from "#/lib/engine/cross-vector3"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { multiplyMatrix3Vector as mv } from "#/lib/engine/multiply-matrix3-vector"
import { hashSurfacePoint } from "#/lib/graphics/ray/hash-surface-point"

import { getSdfRayIntersection } from "#/lib/graphics/ray/get-sdf-ray-intersection"
import { getSdfSurfaceNormal } from "#/lib/graphics/ray/get-sdf-surface-normal"
import { getSphereRayIntersection } from "#/lib/graphics/ray/get-sphere-ray-intersection"
import { getSphereSurfaceNormal } from "#/lib/graphics/ray/get-sphere-surface-normal"
import { getCapsuleRayIntersection } from "#/lib/graphics/ray/get-capsule-ray-intersection"
import { getCapsuleSurfaceNormal } from "#/lib/graphics/ray/get-capsule-surface-normal"
import { getConeRayIntersection } from "#/lib/graphics/ray/get-cone-ray-intersection"
import { getConeSurfaceNormal } from "#/lib/graphics/ray/get-cone-surface-normal"
import { FW, FH, OX, OY, SPPU, eyesDrawn, EYE_DARK } from "#/world/scene/figure/render"
import { shadeRGB } from "#/world/scene/figure/helpers/render/shade-rgb"
import type { PoseFrameOptions } from "#/world/scene/figure/render"

type Props = {
  L: Look
  skeleton: Skel
  view: number
  item: Item
  out: PixBuf
  ox: number
  oy: number
  options?: boolean | PoseFrameOptions
}

export function renderSkeletonFrame(props: Props) {
  const options = props.options === undefined ? false : props.options

  const padding = typeof options === "boolean" ? 0 : options.padding,
    blink = typeof options === "boolean" ? options : options.blink
  const layout = getPaddedFrameLayout({ width: FW, height: FH, originX: OX, originY: OY, padding })
  if (layout instanceof Error) return layout
  if (
    typeof options !== "boolean" &&
    (![props.ox, props.oy].every(Number.isSafeInteger) || props.ox < 0 || props.oy < 0 || props.ox + layout.width > props.out.w || props.oy + layout.height > props.out.h)
  )
    return new Error("Pose frame leaves its pixel buffer")
  const B = buildBody(props.L, props.skeleton, props.item)
  const primitives = appendPrimitives(B.prims, typeof options === "boolean" ? [] : (options.extraPrimitives ?? []))
  if (primitives instanceof Error) return primitives
  const yaw = (props.view / 8) * Math.PI * 2 // camera position angle around the character (0 = in front)
  const camDir: V3 = [Math.sin(yaw) * Math.cos(PITCH), Math.sin(PITCH), Math.cos(yaw) * Math.cos(PITCH)]
  const d = mul(camDir, -1)
  const R = norm(cross(d, [0, 1, 0]))
  const Up = cross(R, d)
  const Lgt = norm(add(add(mul(R, -0.55), mul(Up, 0.75)), mul(camDir, 0.55)))
  const W = layout.width,
    H = layout.height
  const zb = new Float32Array(W * H).fill(Infinity)
  const ids = new Int16Array(W * H).fill(-1)
  const cols: (RGB | null)[] = Array.from<RGB | null>({ length: W * H }).fill(null)
  const rampOf: string[] = Array.from<string>({ length: W * H }).fill("")
  const lnOf = new Uint8Array(W * H),
    grpOf = new Int16Array(W * H)
  const hits = Array.from<V3>({ length: W * H })
  const hitPr = Array.from<Primitive | undefined>({ length: W * H })
  const hitO = Array.from<V3>({ length: W * H })
  const proj = (p: V3) => [OX + dot(p, R) * SPPU + padding, OY - dot(p, Up) * SPPU + padding]
  for (const pr of primitives) {
    // bounding circle on screen
    const c: V3 = pr.kind === "sph" || pr.kind === "sdf" ? pr.a : lerp3(pr.a, pr.b, 0.5)
    const rad = pr.kind === "sph" ? pr.r * Math.max(pr.sx ?? 1, pr.sy ?? 1, pr.sz ?? 1) : pr.kind === "sdf" ? pr.r : Math.hypot(...sub(pr.b, pr.a)) / 2 + Math.max(pr.r, pr.r2)
    const cxState = proj(c),
      cx = cxState[0],
      cy = cxState[1]
    const rp = rad * SPPU + 1.5
    const x0 = Math.max(0, Math.floor(cx - rp)),
      x1 = Math.min(W - 1, Math.ceil(cx + rp))
    const y0 = Math.max(0, Math.floor(cy - rp)),
      y1 = Math.min(H - 1, Math.ceil(cy + rp))
    // thin parts (locks, limbs): skip pixels far from the projected axis
    const seg = pr.kind === "cap" || pr.kind === "cone"
    const axState = seg ? proj(pr.a) : [0, 0],
      ax = axState[0],
      ay = axState[1],
      bxState = seg ? proj(pr.b) : [0, 0],
      bx = bxState[0],
      by = bxState[1]
    const sdx = bx - ax,
      sdy = by - ay,
      sl2 = sdx * sdx + sdy * sdy || 1
    const rr = (Math.max(pr.r, pr.r2) * SPPU + 1.5) ** 2
    for (const y = { value: y0 }; y.value <= y1; y.value++)
      for (const x = { value: x0 }; x.value <= x1; x.value++) {
        if (seg) {
          const px = x.value + 0.5 - ax,
            py = y.value + 0.5 - ay
          const h = Math.min(1, Math.max(0, (px * sdx + py * sdy) / sl2))
          const ex = px - sdx * h,
            ey = py - sdy * h
          if (ex * ex + ey * ey > rr) continue
        }
        const sx = (x.value + 0.5 - layout.originX) / SPPU,
          sy = (layout.originY - y.value - 0.5) / SPPU
        const o: V3 = [R[0] * sx + Up[0] * sy + camDir[0] * 5, R[1] * sx + Up[1] * sy + camDir[1] * 5, R[2] * sx + Up[2] * sy + camDir[2] * 5]
        const t =
          pr.kind === "sph"
            ? getSphereRayIntersection(o, d, pr)
            : pr.kind === "sdf"
              ? getSdfRayIntersection(o, d, pr)
              : pr.kind === "cap"
                ? getCapsuleRayIntersection(o, d, pr)
                : getConeRayIntersection(o, d, pr)
        if (t <= 0) continue
        const k = y.value * W + x.value
        if (t >= zb[k] - 1e-4) continue
        zb[k] = t
        ids[k] = pr.id
        hitPr[k] = pr
        hitO[k] = o
      }
  }
  // shade each covered pixel once (deferred: overdraw between parts is common)
  for (const y = { value: 0 }; y.value < H; y.value++)
    for (const x = { value: 0 }; x.value < W; x.value++) {
      const k = y.value * W + x.value,
        pr = hitPr[k]
      if (!pr) continue
      const q = add(hitO[k], mul(d, zb[k]))
      const n = {
        value: pr.kind === "sph" ? getSphereSurfaceNormal(q, pr) : pr.kind === "sdf" ? getSdfSurfaceNormal(q, pr) : pr.kind === "cap" ? getCapsuleSurfaceNormal(q, pr) : getConeSurfaceNormal(q, pr),
      }
      if (dot(n.value, d) > 0) n.value = mul(n.value, -1) // inside faces
      const rampState = pr.m(q, n.value, Lgt) as [string, number, number?],
        ramp = rampState[0],
        off = rampState[1],
        hatch = rampState[2]
      const diff = Math.max(0, dot(n.value, Lgt))
      const rim = Math.max(0, 1 - dot(n.value, camDir)) ** 3
      const ao = Math.min(1, q[1] / 0.25) * 0.08
      // flat parts (face) mostly ignore the light direction; hair never drops to its darkest
      // tone, so neither shows a stray diagonal terminator line over the eyes
      const fl = pr.flat ?? 0.45 // clothes and limbs read as flat colour areas, not lumps
      const b = { value: 0.2 + (diff * fl + 0.55 * (1 - fl)) * 0.62 + off + ao - rim * 0.12 * fl }
      if (ramp[0] === "h") b.value = Math.max(0.42, b.value)
      // cloth and leather get a woven grain and dithered shade steps, so they read as fabric, not plastic
      const cloth = ramp !== props.L.skin && ramp[0] !== "h" && !pr.ln
      if (cloth) b.value += -0.09 + (hashSurfacePoint([Math.floor(q[0] * 70), Math.floor(q[1] * 70), Math.floor(q[2] * 70)]) - 0.5) * 0.09
      hits[k] = q
      rampOf[k] = ramp
      lnOf[k] = pr.ln ? 1 : 0
      grpOf[k] = pr.grp ?? 0
      if (hatch) {
        // illustration-style diagonal strokes ("/" for light, "\\" for shade)
        const rp = RAMPS[ramp]
        const lvl = Math.min(rp.length - 1, Math.max(0, Math.round(Math.min(1, Math.max(0, b.value)) * (rp.length - 1))))
        cols[k] =
          hatch > 0
            ? (x.value + y.value - padding * 2) % 4 === 0
              ? rp[rp.length - 1]
              : rp[Math.min(rp.length - 2, lvl + 1)]
            : (x.value + y.value - padding * 2) % 3 === 0
              ? rp[Math.max(0, lvl - 1)]
              : rp[lvl]
      } else cols[k] = fl < 1 && !cloth ? shadeRGB({ ramp: "h", b: b.value, x: 0, y: 0, rr: RAMPS[ramp] }) : shadeRGB({ ramp: ramp, b: b.value, x: x.value - padding, y: y.value - padding })
    }
  // interior lines where a nearer part overlaps a farther one
  const finalC = cols.slice()
  for (const y = { value: 0 }; y.value < H; y.value++)
    for (const x = { value: 0 }; x.value < W; x.value++) {
      const k = y.value * W + x.value
      if (ids[k] < 0) continue
      for (const entry of NB4) {
        const dx = entry[0]
        const dy = entry[1]

        const xx = x.value + dx,
          yy = y.value + dy
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue
        const q = yy * W + xx
        if (ids[q] < 0 || ids[q] === ids[k]) continue
        // no line on the face along the fringe: it read as a stray diagonal stroke over the eyes
        if (rampOf[k] === props.L.skin && rampOf[q][0] === "h") continue
        if (zb[q] < zb[k] - 0.06 && rampOf[q] !== rampOf[k]) {
          finalC[k] = RAMPS[rampOf[k]][0]
          break
        }
        // hair clumps: a dark gap where a lock lies over another lock or over the hair mass
        if (rampOf[q] === rampOf[k] && (grpOf[q] || grpOf[k]) && grpOf[q] !== grpOf[k] && zb[q] < zb[k] - 0.012) {
          finalC[k] = RAMPS[rampOf[k]][1]
          break
        }
      }
    }
  // eyes & blush
  const hd = B.head
  const setP = (x: number, y: number, c: RGB) => {
    if (x >= 0 && y >= 0 && x < W && y < H) finalC[y * W + x] = c
  }
  const iris = RAMPS[props.L.eye ?? "cBlue"]
  // where each eye falls on the face (an eye turned away or hidden by hair is left out)
  const eyes: { side: number; ex: number; iy: number; wide: boolean; face: number; lid: number[] }[] = []
  for (const side of [-1, 1]) {
    const dirE = norm(mv(hd.M, [side * 0.27, -0.1, 0.95]))
    const face = dot(dirE, camDir)
    if (face < 0.2) continue
    const p = add(hd.c, mul(dirE, hd.r * 0.98))
    const pxState = proj(p),
      px = pxState[0],
      py = pxState[1]
    const ix = Math.round(px - 0.5),
      iy = Math.round(py - 1.5)
    const k = Math.min(H - 1, Math.max(0, Math.round(py))) * W + Math.min(W - 1, Math.max(0, Math.round(px)))
    // must be on the face, not hidden behind hair/hat/arm
    if (ids[k] < 0 || rampOf[k] !== props.L.skin) continue
    const wide = face > 0.62
    eyes.push({ side, ex: ix, iy, wide, face, lid: [] })
  }
  // the bar across the top (a T's lid, a closed eye's dash) reaches outward, away from the other eye,
  // and the two bars always keep at least one pixel of face between them
  eyes.sort((a, b) => a.ex - b.ex)
  // eyes a pixel apart (the far one, seen from aside) would run together: the far one moves outward
  if (eyes.length === 2 && eyes[1].ex - eyes[0].ex < 2) {
    if (eyes[0].face < eyes[1].face) eyes[0].ex = eyes[1].ex - 2
    else eyes[1].ex = eyes[0].ex + 2
  }
  eyesDrawn.count = eyes.length
  eyes.forEach((e, i) => {
    const out = eyes.length < 2 ? -1 : i === 0 ? -1 : 1
    e.lid = e.wide ? [e.ex - 1, e.ex, e.ex + 1] : [e.ex + out, e.ex].sort((a, b) => a - b)
  })
  if (eyes.length === 2) {
    const aState = eyes,
      a = aState[0],
      b = aState[1]
    // trim the inner ends, never the stroke itself, until there is a gap
    while (Math.max(...a.lid) >= Math.min(...b.lid) - 1) {
      const aIn = Math.max(...a.lid),
        bIn = Math.min(...b.lid)
      if (a.lid.length >= b.lid.length && aIn !== a.ex) a.lid = a.lid.filter((x) => x !== aIn)
      else if (bIn !== b.ex) b.lid = b.lid.filter((x) => x !== bIn)
      else if (aIn !== a.ex) a.lid = a.lid.filter((x) => x !== aIn)
      else break
    }
  }
  for (const entry2 of eyes) {
    const ex = entry2.ex
    const iy = entry2.iy
    const wide = entry2.wide
    const face = entry2.face
    const lid = entry2.lid
    const side = entry2.side

    if (blink) {
      for (const x of lid) setP(x, iy + 1, EYE_DARK)
    } else if (props.L.eyeStyle !== "stroke") {
      // a T: the lid and lashes across in the dark, the iris below it in the eye's own colour
      for (const x of lid) setP(x, iy, EYE_DARK)
      for (const r = { value: 1 }; r.value <= (wide ? 2 : 1); r.value++) setP(ex, iy + r.value, iris[r.value === 1 ? 3 : 2])
    } else {
      // one dark vertical stroke; it keeps its length: if the fringe hides the top, the stroke starts lower
      for (const r = { value: 0 }; r.value < (wide ? 3 : 2); r.value++) setP(ex, iy + r.value, EYE_DARK)
    }
    if (face > 0.5) {
      const bx = Math.round(proj(add(hd.c, mul(norm(mv(hd.M, [side * 0.62, -0.32, 0.72])), hd.r)))[0] - 0.5)
      const by = iy + 3
      const kb = by * W + bx
      if (rampOf[kb] === props.L.skin) {
        setP(bx, by, BLUSH)
        if (rampOf[kb + 1] === props.L.skin) setP(bx + 1, by, BLUSH)
        if (wide && rampOf[kb - 1] === props.L.skin) setP(bx - 1, by, BLUSH)
      }
    }
  }
  // write + exterior outline
  for (const y = { value: 0 }; y.value < H; y.value++)
    for (const x = { value: 0 }; x.value < W; x.value++) {
      const k = y.value * W + x.value
      if (finalC[k]) {
        props.out.set({ x: props.ox + x.value, y: props.oy + y.value, color: finalC[k]! })
        continue
      }
      const nb = { value: -1 }
      for (const entry3 of NB4) {
        const dx = entry3[0]
        const dy = entry3[1]

        const xx = x.value + dx,
          yy = y.value + dy
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue
        if (ids[yy * W + xx] >= 0) {
          nb.value = yy * W + xx
          break
        }
      }
      if (nb.value >= 0) {
        const r0 = RAMPS[rampOf[nb.value]][0]
        props.out.set({ x: props.ox + x.value, y: props.oy + y.value, color: [(r0[0] + OUTLINE[0]) >> 1, (r0[1] + OUTLINE[1]) >> 1, (r0[2] + OUTLINE[2]) >> 1] })
      }
    }
}
