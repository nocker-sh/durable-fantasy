/** Stable daily variation shared by every town visitor. */
export function townEventHash(value: number): number {
  const first = Math.imul(value ^ 0x9e3779b9, 0x85ebca6b)
  const mixed = Math.imul(first ^ (first >>> 13), 0xc2b2ae35)
  return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296
}
