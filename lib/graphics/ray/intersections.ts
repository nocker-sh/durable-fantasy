import { type V3, sub, dot, norm, add, mul, cross } from "./vector.ts";
import type { Primitive } from "./primitives.ts";

function hitSdf(o: V3, d: V3, p: Primitive): number {
  const oc = sub(o, p.a),
    b = dot(oc, d),
    c = dot(oc, oc) - p.r * p.r,
    h = b * b - c;
  if (h < 0) return -1;
  const sq = Math.sqrt(h);
  let t = -b - sq;
  const t1 = -b + sq;
  const q: V3 = [0, 0, 0];
  for (let i = 0; i < 80 && t < t1; i++) {
    q[0] = o[0] + d[0] * t;
    q[1] = o[1] + d[1] * t;
    q[2] = o[2] + d[2] * t;
    const dd = p.sd!(q);
    if (dd < 2e-4) return t;
    t += Math.max(dd * 0.9, 1e-4);
  }
  return -1;
}

function nSdf(q: V3, p: Primitive): V3 {
  const e = 1e-3,
    f = p.sd!;
  return norm([f(add(q, [e, 0, 0])) - f(sub(q, [e, 0, 0])), f(add(q, [0, e, 0])) - f(sub(q, [0, e, 0])), f(add(q, [0, 0, e])) - f(sub(q, [0, 0, e]))]);
}

// ---------------------------------------------------------------- intersections (orthographic rays)
function hitSphere(o: V3, d: V3, p: Primitive): number {
  const s: V3 = [p.sx ?? 1, p.sy ?? 1, p.sz ?? 1];
  const oc: V3 = [(o[0] - p.a[0]) / s[0], (o[1] - p.a[1]) / s[1], (o[2] - p.a[2]) / s[2]];
  const dd: V3 = [d[0] / s[0], d[1] / s[1], d[2] / s[2]];
  const A = dot(dd, dd),
    B = dot(oc, dd),
    C = dot(oc, oc) - p.r * p.r;
  const h = B * B - A * C;
  if (h < 0) return -1;
  const sq = Math.sqrt(h);
  const t0 = (-B - sq) / A;
  if (!p.clip) return t0;
  if (p.clip(add(o, mul(d, t0)))) return t0;
  const t1 = (-B + sq) / A;
  if (p.clip(add(o, mul(d, t1)))) return t1; // inside of a shell (e.g. under a hood)
  return -1;
}

function nSphere(q: V3, p: Primitive): V3 {
  const s: V3 = [p.sx ?? 1, p.sy ?? 1, p.sz ?? 1];
  return norm([(q[0] - p.a[0]) / (s[0] * s[0]), (q[1] - p.a[1]) / (s[1] * s[1]), (q[2] - p.a[2]) / (s[2] * s[2])]);
}

function hitCap(ro: V3, rd: V3, p: Primitive): number {
  const ba = sub(p.b, p.a),
    oa = sub(ro, p.a);
  const baba = dot(ba, ba),
    bard = dot(ba, rd),
    baoa = dot(ba, oa),
    rdoa = dot(rd, oa),
    oaoa = dot(oa, oa);
  const a = baba - bard * bard,
    b = baba * rdoa - baoa * bard,
    c = baba * oaoa - baoa * baoa - p.r * p.r * baba;
  const h = b * b - a * c;
  if (h >= 0 && a > 1e-9) {
    const t = (-b - Math.sqrt(h)) / a;
    const y = baoa + t * bard;
    if (y > 0 && y < baba) return t;
    const oc = y <= 0 ? oa : sub(ro, p.b);
    const b2 = dot(rd, oc),
      c2 = dot(oc, oc) - p.r * p.r,
      h2 = b2 * b2 - c2;
    if (h2 > 0) return -b2 - Math.sqrt(h2);
  } else if (a <= 1e-9) {
    // ray parallel to the axis: treat as sphere at nearer end
    for (const e of [p.a, p.b]) {
      const oc = sub(ro, e),
        b2 = dot(rd, oc),
        c2 = dot(oc, oc) - p.r * p.r,
        h2 = b2 * b2 - c2;
      if (h2 > 0) return -b2 - Math.sqrt(h2);
    }
  }
  return -1;
}

function nCap(q: V3, p: Primitive): V3 {
  const ba = sub(p.b, p.a);
  const t = Math.min(1, Math.max(0, dot(sub(q, p.a), ba) / dot(ba, ba)));
  return norm(sub(q, add(p.a, mul(ba, t))));
}

function coneFrame(p: Primitive) {
  const w = norm(sub(p.b, p.a));
  const u = norm(Math.abs(w[1]) < 0.9 ? cross(w, [0, 1, 0]) : cross(w, [1, 0, 0]));
  const v = cross(w, u);
  return { u, v, w, h: Math.hypot(...sub(p.b, p.a)) };
}

function hitCone(ro: V3, rd: V3, p: Primitive): number {
  const F = p.F ?? (p.F = coneFrame(p));
  const u = F.u,
    v = F.v,
    w = F.w;
  const o0 = ro[0] - p.a[0],
    o1 = ro[1] - p.a[1],
    o2 = ro[2] - p.a[2];
  const ox = o0 * u[0] + o1 * u[1] + o2 * u[2],
    oy = o0 * v[0] + o1 * v[1] + o2 * v[2],
    oz = o0 * w[0] + o1 * w[1] + o2 * w[2];
  const dx = rd[0] * u[0] + rd[1] * u[1] + rd[2] * u[2],
    dy = rd[0] * v[0] + rd[1] * v[1] + rd[2] * v[2],
    dz = rd[0] * w[0] + rd[1] * w[1] + rd[2] * w[2];
  const k = (p.r2 - p.r) / F.h;
  // x^2 + y^2 = (r + k z)^2
  const A = dx * dx + dy * dy - k * k * dz * dz;
  const rz = p.r + k * oz;
  const B = 2 * (ox * dx + oy * dy - rz * k * dz);
  const C = ox * ox + oy * oy - rz * rz;
  const disc = B * B - 4 * A * C;
  let best = -1;
  if (disc >= 0 && Math.abs(A) > 1e-9) {
    const sq = Math.sqrt(disc);
    let ta = (-B - sq) / (2 * A),
      tb = (-B + sq) / (2 * A);
    if (ta > tb) {
      const t = ta;
      ta = tb;
      tb = t;
    }
    for (const t of [ta, tb]) {
      const z = oz + t * dz;
      if (t > 0 && z >= 0 && z <= F.h && p.r + k * z > 0) {
        best = t;
        break;
      }
    }
  }
  // top cap
  if (Math.abs(dz) > 1e-6) {
    const t = (F.h - oz) / dz;
    const x = ox + t * dx,
      y = oy + t * dy;
    if (t > 0 && x * x + y * y <= p.r2 * p.r2 && (best < 0 || t < best)) best = t;
  }
  return best;
}

function nCone(q: V3, p: Primitive): V3 {
  const F = p.F ?? (p.F = coneFrame(p));
  const o = sub(q, p.a);
  const z = dot(o, F.w);
  if (z > F.h - 1e-3) return F.w;
  const x = dot(o, F.u),
    y = dot(o, F.v);
  const k = (p.r2 - p.r) / F.h;
  const rr = Math.hypot(x, y) || 1;
  const nl = norm([x / rr, y / rr, -k] as V3);
  return norm(add(add(mul(F.u, nl[0]), mul(F.v, nl[1])), mul(F.w, nl[2])));
}

export { hitSdf, nSdf, hitSphere, nSphere, hitCap, nCap, hitCone, nCone };
