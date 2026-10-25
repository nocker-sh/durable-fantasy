import { PixBuf, pick, hash2, vnoise, RAMPS } from "../pix";
import { lvl, PPU } from "./palette.ts";

/** Laid stone: each block a flat tone, lit along its top, shadowed at its foot, mortar between. */
export function stoneTex(ramp = "stone", light = 0.55, seed = 1, bw = 20, bh = 11, size = 128): PixBuf {
  const b = new PixBuf(size, size);
  const n = RAMPS[ramp].length,
    base = Math.round(light * (n - 1));
  b.fill((x, y) => {
    const row = Math.floor(y / bh);
    const uu = x / bw + (row % 2) * 0.5;
    const c = Math.floor(uu);
    const fu = uu - c,
      fv = y / bh - row;
    const h = hash2(c % Math.round(size / bw), row, seed);
    let l = base + (h > 0.8 ? 1 : h < 0.15 ? -1 : 0);
    if (fu < 0.06 || fv > 0.88) return lvl(ramp, base - 2); // mortar
    if (fv < 0.18) l += 1;
    else if (fv > 0.74 || fu > 0.9) l -= 1;
    // a chipped corner or a stain, as a small block of the darker tone
    if (hash2(c, row, seed + 11) > 0.85 && fu > 0.6 && fv > 0.45) l -= 1;
    return lvl(ramp, l);
  });
  return b;
}

/**
 * Rock as pixel art: broken into flat facets (cells), each lit or shaded by which way it faces,
 * dark cracks where facets meet, lichen in small pale patches.
 */
export function rockTex(ramp = "stone", light = 0.5, seed = 1, size = 64): PixBuf {
  const b = new PixBuf(size, size);
  const n = RAMPS[ramp].length,
    base = Math.round(light * (n - 1));
  const cell = 12,
    cells = size / cell;
  // a few points per cell, wrapping, each a facet
  const pt = (gx: number, gy: number): [number, number] => {
    const wx = ((gx % cells) + cells) % cells,
      wy = ((gy % cells) + cells) % cells;
    return [gx * cell + hash2(wx, wy, seed) * cell, gy * cell + hash2(wx, wy, seed + 1) * cell];
  };
  b.fill((x, y) => {
    const cx = Math.floor(x / cell),
      cy = Math.floor(y / cell);
    let d1 = 1e9,
      d2 = 1e9,
      best: [number, number] = [0, 0];
    for (let oy = -1; oy <= 1; oy++)
      for (let ox = -1; ox <= 1; ox++) {
        const [px, py] = pt(cx + ox, cy + oy);
        const d = (px - x) ** 2 + (py - y) ** 2;
        if (d < d1) {
          d2 = d1;
          d1 = d;
          best = [cx + ox, cy + oy];
        } else if (d < d2) d2 = d;
      }
    if (Math.sqrt(d2) - Math.sqrt(d1) < 1.1) return lvl(ramp, base - 2); // crack
    const wx = ((best[0] % cells) + cells) % cells,
      wy = ((best[1] % cells) + cells) % cells;
    const face = hash2(wx, wy, seed + 2);
    let l = base + (face > 0.66 ? 1 : face < 0.25 ? -1 : 0);
    // lichen: a few pale spots on some facets
    if (hash2(wx, wy, seed + 3) > 0.7 && hash2(x >> 1, y >> 1, seed + 4) > 0.82) return lvl("frost", 2);
    // the facet's edge nearest the light, a pixel lighter
    if (Math.sqrt(d2) - Math.sqrt(d1) < 2.2 && y < best[1] * cell + cell / 2) l += 1;
    return lvl(ramp, l);
  });
  return b;
}

/** Ashlar stone wall with lancet windows (for the chapel). */
export function ashlarTex(w: number, h: number, lancets: number[], door?: number, rose = false, seed = 9): [PixBuf, PixBuf] {
  const W = Math.round(w * PPU),
    H = Math.round(h * PPU);
  const b = new PixBuf(W, H);
  const glow = new PixBuf(W, H);
  glow.fill(() => [0, 0, 0]);
  b.fill((x, y) => {
    const bh = 12,
      row = Math.floor(y / bh);
    const bw = 26 + (row % 3) * 4;
    const uu = x / bw + (row % 2) * 0.5,
      c = Math.floor(uu),
      fu = uu - c,
      fv = y / bh - row;
    let l = 0.6 + (hash2(c, row, seed) - 0.5) * 0.2 + (fv < 0.2 ? 0.08 : 0) - (y / H > 0.85 ? 0.15 : 0);
    if (vnoise(x, y, 0.04, seed) > 0.72) l -= 0.12;
    if (fu < 0.04 || fv > 0.9) l = 0.25;
    return pick("sand", l, x, y, 0.4);
  });
  const lancet = (cx: number, top: number, ww: number, hh: number) => {
    for (let y = top - 4; y < top + hh + 4; y++)
      for (let x = cx - ww / 2 - 4; x < cx + ww / 2 + 4; x++) {
        const dy = y - top,
          r = ww / 2;
        const inArch = (pad: number) =>
          dy >= r + pad ? Math.abs(x - cx + 0.5) < r + pad : Math.hypot(Math.abs(x - cx + 0.5) + r * 0.6, dy - r - pad) < r * 1.6 + pad && Math.abs(x - cx + 0.5) < r + pad;
        if (!inArch(3)) continue;
        if (!inArch(0) || y >= top + hh) {
          b.set(x, y, pick("sand", 0.8 - (x > cx ? 0.25 : 0), x, y));
          continue;
        }
        const lead = (x - cx + 64) % 5 === 0 || (y - top) % 7 === 0;
        const hue = ["cBlue", "cRed", "cMustard", "cGreen"][Math.floor(hash2(((x - cx + 64) / 5) | 0, ((y - top) / 7) | 0, 3) * 4)];
        b.set(x, y, lead ? RAMPS.iron[0] : pick(hue, 0.55, x, y));
        if (!lead) glow.set(x, y, pick(hue, 0.85, x, y));
      }
  };
  for (const u of lancets) lancet(Math.round(u * PPU), Math.round(H * 0.25), 14, Math.round(H * 0.45));
  if (rose) {
    const cx = W / 2,
      cy = H * 0.3,
      r = 18;
    for (let y = cy - r - 3; y < cy + r + 3; y++)
      for (let x = cx - r - 3; x < cx + r + 3; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d > r + 3) continue;
        if (d > r) {
          b.set(x, y, pick("sand", 0.8, x, y));
          continue;
        }
        const a = Math.atan2(y - cy, x - cx);
        const spoke = Math.abs((((a / Math.PI) * 4 + 8) % 1) - 0.5) < 0.12 || Math.abs(d - r * 0.45) < 1;
        const hue = d < r * 0.45 ? "cMustard" : (((a / Math.PI) * 4 + 8) | 0) % 2 ? "cBlue" : "cRed";
        b.set(x, y, spoke ? RAMPS.iron[0] : pick(hue, 0.55, x, y));
        if (!spoke) glow.set(x, y, pick(hue, 0.85, x, y));
      }
  }
  if (door !== undefined) {
    const cx = Math.round(door * PPU),
      ww = 30,
      hh = 56,
      top = H - hh;
    for (let y = top - 8; y < H; y++)
      for (let x = cx - ww / 2 - 8; x < cx + ww / 2 + 8; x++) {
        const dy = y - top;
        const pad = Math.abs(x - cx) > ww / 2 || (dy < ww / 2 && Math.hypot(x - cx, dy - ww / 2) > ww / 2);
        const outer = Math.abs(x - cx) > ww / 2 + 8 || (dy < ww / 2 && Math.hypot(x - cx, dy - ww / 2) > ww / 2 + 8);
        if (outer) continue;
        if (pad) {
          b.set(x, y, pick("sand", 0.82 - ((Math.hypot(x - cx, Math.min(0, dy - ww / 2)) | 0) % 4 === 0 ? 0.3 : 0), x, y));
          continue;
        }
        const k = (x - cx + 64) % 6;
        b.set(x, y, pick("wood", k === 0 ? 0.2 : 0.5 + (k === 1 ? 0.15 : 0), x, y, 0.3));
        if (dy % 16 === 10 && Math.abs(x - cx) > 2) b.set(x, y, RAMPS.iron[2]);
      }
  }
  return [b, glow];
}
