// Value noise and a hash: the same numbers in the browser, the workers, the server and the tests.

export function hash2(a: number, b: number, seed = 0): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(seed | 0, 2246822519 | 0)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) & 0xffff) / 65535;
}

export function vnoise(x: number, y: number, scale: number, seed: number): number {
  const u = x * scale,
    v = y * scale;
  const iu = Math.floor(u),
    iv = Math.floor(v);
  let fu = u - iu,
    fv = v - iv;
  fu = fu * fu * (3 - 2 * fu);
  fv = fv * fv * (3 - 2 * fv);
  const r = (a: number, b: number) => hash2(a + 5000, b + 5000, seed);
  return r(iu, iv) * (1 - fu) * (1 - fv) + r(iu + 1, iv) * fu * (1 - fv) + r(iu, iv + 1) * (1 - fu) * fv + r(iu + 1, iv + 1) * fu * fv;
}

export function fbm(x: number, y: number, scale: number, seed: number): number {
  return vnoise(x, y, scale, seed) * 0.55 + vnoise(x, y, scale * 2.3, seed + 1) * 0.3 + vnoise(x, y, scale * 5.1, seed + 2) * 0.15;
}
