const JST = 9 * 3_600_000

/** The date in Japan as y, m, d. */
export function jstDate(now: number): { y: number; m: number; d: number } {
  const t = new Date(now + JST)
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}
