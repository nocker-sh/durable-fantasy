import { type PixBuf, RAMPS, type RGB, bayer, hex, OUTLINE } from "../pix";
import type { Look, Item } from "./look.ts";
import { type Anim, skelFor, blinks } from "./animation.ts";
import { buildBody } from "./body.ts";
import { type V3, mul, norm, cross, add, dot, lerp3, sub, mv } from "../../../lib/graphics/ray/vector.ts";
import { type Primitive, hash01 } from "../../../lib/graphics/ray/primitives.ts";
import { hitSphere, hitSdf, hitCap, hitCone, nSphere, nSdf, nCap, nCone } from "../../../lib/graphics/ray/intersections.ts";

// ---------------------------------------------------------------- rendering
const NB4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

export const FW = 76,
  FH = 100,
  OX = 38,
  OY = 92;

// frame size and feet anchor (px)
export const SPPU = 48;

// sprite pixels per world unit
const PITCH = 0.36;

const shadeRGB = (ramp: string, b: number, x: number, y: number, rr?: RGB[]): RGB => {
  const r = rr ?? RAMPS[ramp]; // a ramp name starting with 'h' means no dither
  const n = r.length;
  // hair is cel shaded (no dither) so locks read as clean shapes
  const t = Math.min(1, Math.max(0, b)) * (n - 1) + (ramp[0] === "h" ? 0 : bayer(x, y) * 0.35);
  return r[Math.min(n - 1, Math.max(0, Math.round(t)))];
};

/** how many eyes the last frame drew (for tests) */
export const eyesDrawn = { count: 0 };

export const EYE_DARK = hex("#20182a");

const BLUSH = hex("#e89c8c");

export function renderFrame(L: Look, anim: Anim, f: number, view: number, item: Item, out: PixBuf, ox: number, oy: number) {
  const B = buildBody(L, skelFor(L, anim, f), item);
  const yaw = (view / 8) * Math.PI * 2; // camera position angle around the character (0 = in front)
  const camDir: V3 = [Math.sin(yaw) * Math.cos(PITCH), Math.sin(PITCH), Math.cos(yaw) * Math.cos(PITCH)];
  const d = mul(camDir, -1);
  const R = norm(cross(d, [0, 1, 0]));
  const Up = cross(R, d);
  const Lgt = norm(add(add(mul(R, -0.55), mul(Up, 0.75)), mul(camDir, 0.55)));
  const W = FW,
    H = FH;
  const zb = new Float32Array(W * H).fill(Infinity);
  const ids = new Int16Array(W * H).fill(-1);
  const cols: (RGB | null)[] = Array.from<RGB | null>({ length: W * H }).fill(null);
  const rampOf: string[] = Array.from<string>({ length: W * H }).fill("");
  const lnOf = new Uint8Array(W * H),
    grpOf = new Int16Array(W * H);
  const hits = Array.from<V3>({ length: W * H });
  const hitPr = Array.from<Primitive | undefined>({ length: W * H });
  const hitO = Array.from<V3>({ length: W * H });
  const proj = (p: V3) => [OX + dot(p, R) * SPPU, OY - dot(p, Up) * SPPU];
  for (const pr of B.prims) {
    // bounding circle on screen
    let c: V3, rad: number;
    if (pr.kind === "sph") {
      c = pr.a;
      rad = pr.r * Math.max(pr.sx ?? 1, pr.sy ?? 1, pr.sz ?? 1);
    } else if (pr.kind === "sdf") {
      c = pr.a;
      rad = pr.r;
    } else {
      c = lerp3(pr.a, pr.b, 0.5);
      rad = Math.hypot(...sub(pr.b, pr.a)) / 2 + Math.max(pr.r, pr.r2);
    }
    const [cx, cy] = proj(c);
    const rp = rad * SPPU + 1.5;
    const x0 = Math.max(0, Math.floor(cx - rp)),
      x1 = Math.min(W - 1, Math.ceil(cx + rp));
    const y0 = Math.max(0, Math.floor(cy - rp)),
      y1 = Math.min(H - 1, Math.ceil(cy + rp));
    // thin parts (locks, limbs): skip pixels far from the projected axis
    const seg = pr.kind === "cap" || pr.kind === "cone";
    const [ax, ay] = seg ? proj(pr.a) : [0, 0],
      [bx, by] = seg ? proj(pr.b) : [0, 0];
    const sdx = bx - ax,
      sdy = by - ay,
      sl2 = sdx * sdx + sdy * sdy || 1;
    const rr = (Math.max(pr.r, pr.r2) * SPPU + 1.5) ** 2;
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        if (seg) {
          const px = x + 0.5 - ax,
            py = y + 0.5 - ay;
          const h = Math.min(1, Math.max(0, (px * sdx + py * sdy) / sl2));
          const ex = px - sdx * h,
            ey = py - sdy * h;
          if (ex * ex + ey * ey > rr) continue;
        }
        const sx = (x + 0.5 - OX) / SPPU,
          sy = (OY - y - 0.5) / SPPU;
        const o: V3 = [R[0] * sx + Up[0] * sy + camDir[0] * 5, R[1] * sx + Up[1] * sy + camDir[1] * 5, R[2] * sx + Up[2] * sy + camDir[2] * 5];
        const t = pr.kind === "sph" ? hitSphere(o, d, pr) : pr.kind === "sdf" ? hitSdf(o, d, pr) : pr.kind === "cap" ? hitCap(o, d, pr) : hitCone(o, d, pr);
        if (t <= 0) continue;
        const k = y * W + x;
        if (t >= zb[k] - 1e-4) continue;
        zb[k] = t;
        ids[k] = pr.id;
        hitPr[k] = pr;
        hitO[k] = o;
      }
  }
  // shade each covered pixel once (deferred: overdraw between parts is common)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = y * W + x,
        pr = hitPr[k];
      if (!pr) continue;
      const q = add(hitO[k], mul(d, zb[k]));
      let n = pr.kind === "sph" ? nSphere(q, pr) : pr.kind === "sdf" ? nSdf(q, pr) : pr.kind === "cap" ? nCap(q, pr) : nCone(q, pr);
      if (dot(n, d) > 0) n = mul(n, -1); // inside faces
      const [ramp, off, hatch] = pr.m(q, n, Lgt) as [string, number, number?];
      const diff = Math.max(0, dot(n, Lgt));
      const rim = Math.max(0, 1 - dot(n, camDir)) ** 3;
      const ao = Math.min(1, q[1] / 0.25) * 0.08;
      // flat parts (face) mostly ignore the light direction; hair never drops to its darkest
      // tone, so neither shows a stray diagonal terminator line over the eyes
      const fl = pr.flat ?? 0.45; // clothes and limbs read as flat colour areas, not lumps
      let b = 0.2 + (diff * fl + 0.55 * (1 - fl)) * 0.62 + off + ao - rim * 0.12 * fl;
      if (ramp[0] === "h") b = Math.max(0.42, b);
      // cloth and leather get a woven grain and dithered shade steps, so they read as fabric, not plastic
      const cloth = ramp !== L.skin && ramp[0] !== "h" && !pr.ln;
      if (cloth) b += -0.09 + (hash01([Math.floor(q[0] * 70), Math.floor(q[1] * 70), Math.floor(q[2] * 70)]) - 0.5) * 0.09;
      hits[k] = q;
      rampOf[k] = ramp;
      lnOf[k] = pr.ln ? 1 : 0;
      grpOf[k] = pr.grp ?? 0;
      if (hatch) {
        // illustration-style diagonal strokes ("/" for light, "\\" for shade)
        const rp = RAMPS[ramp];
        const lvl = Math.min(rp.length - 1, Math.max(0, Math.round(Math.min(1, Math.max(0, b)) * (rp.length - 1))));
        cols[k] = hatch > 0 ? ((x + y) % 4 === 0 ? rp[rp.length - 1] : rp[Math.min(rp.length - 2, lvl + 1)]) : (x + y) % 3 === 0 ? rp[Math.max(0, lvl - 1)] : rp[lvl];
      } else cols[k] = fl < 1 && !cloth ? shadeRGB("h", b, 0, 0, RAMPS[ramp]) : shadeRGB(ramp, b, x, y);
    }
  // interior lines where a nearer part overlaps a farther one
  const finalC = cols.slice();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      if (ids[k] < 0) continue;
      for (const [dx, dy] of NB4) {
        const xx = x + dx,
          yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const q = yy * W + xx;
        if (ids[q] < 0 || ids[q] === ids[k]) continue;
        // no line on the face along the fringe: it read as a stray diagonal stroke over the eyes
        if (rampOf[k] === L.skin && rampOf[q][0] === "h") continue;
        if (zb[q] < zb[k] - 0.06 && rampOf[q] !== rampOf[k]) {
          finalC[k] = RAMPS[rampOf[k]][0];
          break;
        }
        // hair clumps: a dark gap where a lock lies over another lock or over the hair mass
        if (rampOf[q] === rampOf[k] && (grpOf[q] || grpOf[k]) && grpOf[q] !== grpOf[k] && zb[q] < zb[k] - 0.012) {
          finalC[k] = RAMPS[rampOf[k]][1];
          break;
        }
      }
    }
  // eyes & blush
  const hd = B.head;
  const blink = blinks(anim, f);
  const setP = (x: number, y: number, c: RGB) => {
    if (x >= 0 && y >= 0 && x < W && y < H) finalC[y * W + x] = c;
  };
  const iris = RAMPS[L.eye ?? "cBlue"];
  // where each eye falls on the face (an eye turned away or hidden by hair is left out)
  const eyes: { side: number; ex: number; iy: number; wide: boolean; face: number; lid: number[] }[] = [];
  for (const side of [-1, 1]) {
    const dirE = norm(mv(hd.M, [side * 0.27, -0.1, 0.95]));
    const face = dot(dirE, camDir);
    if (face < 0.2) continue;
    const p = add(hd.c, mul(dirE, hd.r * 0.98));
    const [px, py] = proj(p);
    const ix = Math.round(px - 0.5),
      iy = Math.round(py - 1.5);
    const k = Math.min(H - 1, Math.max(0, Math.round(py))) * W + Math.min(W - 1, Math.max(0, Math.round(px)));
    // must be on the face, not hidden behind hair/hat/arm
    if (ids[k] < 0 || rampOf[k] !== L.skin) continue;
    const wide = face > 0.62;
    eyes.push({ side, ex: ix, iy, wide, face, lid: [] });
  }
  // the bar across the top (a T's lid, a closed eye's dash) reaches outward, away from the other eye,
  // and the two bars always keep at least one pixel of face between them
  eyes.sort((a, b) => a.ex - b.ex);
  // eyes a pixel apart (the far one, seen from aside) would run together: the far one moves outward
  if (eyes.length === 2 && eyes[1].ex - eyes[0].ex < 2) {
    if (eyes[0].face < eyes[1].face) eyes[0].ex = eyes[1].ex - 2;
    else eyes[1].ex = eyes[0].ex + 2;
  }
  eyesDrawn.count = eyes.length;
  eyes.forEach((e, i) => {
    const out = eyes.length < 2 ? -1 : i === 0 ? -1 : 1;
    e.lid = e.wide ? [e.ex - 1, e.ex, e.ex + 1] : [e.ex + out, e.ex].sort((a, b) => a - b);
  });
  if (eyes.length === 2) {
    const [a, b] = eyes;
    // trim the inner ends, never the stroke itself, until there is a gap
    while (Math.max(...a.lid) >= Math.min(...b.lid) - 1) {
      const aIn = Math.max(...a.lid),
        bIn = Math.min(...b.lid);
      if (a.lid.length >= b.lid.length && aIn !== a.ex) a.lid = a.lid.filter((x) => x !== aIn);
      else if (bIn !== b.ex) b.lid = b.lid.filter((x) => x !== bIn);
      else if (aIn !== a.ex) a.lid = a.lid.filter((x) => x !== aIn);
      else break;
    }
  }
  for (const { ex, iy, wide, face, lid, side } of eyes) {
    if (blink) {
      for (const x of lid) setP(x, iy + 1, EYE_DARK);
    } else if (L.eyeStyle !== "stroke") {
      // a T: the lid and lashes across in the dark, the iris below it in the eye's own colour
      for (const x of lid) setP(x, iy, EYE_DARK);
      for (let r = 1; r <= (wide ? 2 : 1); r++) setP(ex, iy + r, iris[r === 1 ? 3 : 2]);
    } else {
      // one dark vertical stroke; it keeps its length: if the fringe hides the top, the stroke starts lower
      for (let r = 0; r < (wide ? 3 : 2); r++) setP(ex, iy + r, EYE_DARK);
    }
    if (face > 0.5) {
      const bx = Math.round(proj(add(hd.c, mul(norm(mv(hd.M, [side * 0.62, -0.32, 0.72])), hd.r)))[0] - 0.5);
      const by = iy + 3;
      const kb = by * W + bx;
      if (rampOf[kb] === L.skin) {
        setP(bx, by, BLUSH);
        if (rampOf[kb + 1] === L.skin) setP(bx + 1, by, BLUSH);
        if (wide && rampOf[kb - 1] === L.skin) setP(bx - 1, by, BLUSH);
      }
    }
  }
  // write + exterior outline
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      if (finalC[k]) {
        out.set(ox + x, oy + y, finalC[k]!);
        continue;
      }
      let nb = -1;
      for (const [dx, dy] of NB4) {
        const xx = x + dx,
          yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        if (ids[yy * W + xx] >= 0) {
          nb = yy * W + xx;
          break;
        }
      }
      if (nb >= 0) {
        const r0 = RAMPS[rampOf[nb]][0];
        out.set(ox + x, oy + y, [(r0[0] + OUTLINE[0]) >> 1, (r0[1] + OUTLINE[1]) >> 1, (r0[2] + OUTLINE[2]) >> 1]);
      }
    }
}
