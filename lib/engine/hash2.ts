/** Browser and server use the same integer hash and inclusive unit interval. */
export function hash2(a: number, b: number, seed = 0): number {
  const mixed = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(seed | 0, 2246822519 | 0)) >>> 0
  const hashed = Math.imul(mixed ^ (mixed >>> 13), 1274126177) >>> 0
  return ((hashed ^ (hashed >>> 16)) & 0xffff) / 65535
}
