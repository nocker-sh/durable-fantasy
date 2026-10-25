import type * as THREE from "three";
import { GB } from "../gfx";
import { hash2 } from "../pix";
import { groundH, blockCircle } from "../world";
import { M } from "./materials.ts";
import type { V2 } from "./registry.ts";

// ---------------------------------------------------------------- props
function stair(root: THREE.Group, x0: number, x1: number, zTop: number, zBot: number, yTop: number, yBot: number, n: number, m = M.ashlar) {
  const gb = new GB();
  const dir = Math.sign(zBot - zTop);
  for (let i = 0; i < n; i++) {
    const za = zTop + ((zBot - zTop) * i) / n,
      zb = zTop + ((zBot - zTop) * (i + 1)) / n;
    const yy = yTop + ((yBot - yTop) * (i + 1)) / n;
    gb.box(m, m, x0, yBot - 0.4, Math.min(za, zb) - (dir > 0 ? 0 : 0.02), x1, yy, Math.max(za, zb) + 0.02, 4);
  }
  root.add(gb.build());
}

export function fence(root: THREE.Group, pts: V2[], gaps: V2[] = [], h = 0.7) {
  const gb = new GB();
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i],
      [bx, bz] = pts[i + 1];
    const L = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.round(L / 0.9));
    for (let k = 0; k <= n; k++) {
      const x = ax + ((bx - ax) * k) / n,
        z = az + ((bz - az) * k) / n;
      const gapHere = gaps.some(([gx, gz]) => Math.hypot(gx - x, gz - z) < 0.6);
      const y = groundH(x, z);
      if (!gapHere) gb.box(hash2(k, i, 3) > 0.7 ? M.woodDark : M.woodV, M.woodDark, x - 0.05, y - 0.2, z - 0.05, x + 0.05, y + h + (hash2(k, i, 1) - 0.5) * 0.16, z + 0.05, 2);
      if (k < n) {
        const x2 = ax + ((bx - ax) * (k + 1)) / n,
          z2 = az + ((bz - az) * (k + 1)) / n;
        const gap2 = gaps.some(([gx, gz]) => Math.hypot(gx - (x + x2) / 2, gz - (z + z2) / 2) < 0.6);
        if (gap2) continue;
        const y2 = groundH(x2, z2);
        // old fences: here a rail gone, there one broken off short or sagging, some boards darker with age
        const wear = hash2(k, i, 7);
        for (const [r, hh0] of [
          [0, h * 0.45],
          [1, h * 0.85],
        ] as const) {
          if (wear > 0.9 && r === 1) continue; // the top rail gone
          const broken = wear > 0.82 && wear <= 0.9 && r === 0;
          const end = broken ? 0.45 : 1;
          const sag = wear < 0.08 ? -0.07 : 0;
          const ex = x + (x2 - x) * end,
            ez = z + (z2 - z) * end,
            ey = y + (y2 - y) * end;
          const nx = -(z2 - z),
            nz = x2 - x,
            nl = Math.hypot(nx, nz) || 1;
          const ox = (nx / nl) * 0.03,
            oz = (nz / nl) * 0.03;
          const rm = hash2(k, i * 3 + r, 9) > 0.65 ? M.woodDark : M.wood;
          gb.quad(rm, [x + ox, y + hh0, z + oz], [ex + ox, ey + hh0 + sag, ez + oz], [ex + ox, ey + hh0 + sag + 0.08, ez + oz], [x + ox, y + hh0 + 0.08, z + oz], 2, 2);
          gb.quad(rm, [ex - ox, ey + hh0 + sag, ez - oz], [x - ox, y + hh0, z - oz], [x - ox, y + hh0 + 0.08, z - oz], [ex - ox, ey + hh0 + sag + 0.08, ez - oz], 2, 2);
        }
        for (let s = 0; s <= 6; s++) {
          const t = s / 6,
            fx = x + (x2 - x) * t,
            fz = z + (z2 - z) * t;
          const gh = gaps.some(([gx, gz]) => Math.hypot(gx - fx, gz - fz) < 0.6);
          if (!gh) blockCircle(fx, fz, 0.2);
        }
      }
    }
  }
  root.add(gb.build());
}

export { stair };
