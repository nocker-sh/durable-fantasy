import type { Stack } from "#/world/core/bag-types"

/** An exact selected stack, including quantity, maker, quality and tool wear. */
export function sameStack(a: Stack | null | undefined, b: Stack | null | undefined): boolean {
  return a === b || (!!a && !!b && a.item === b.item && a.count === b.count && a.q === b.q && a.by === b.by && a.dur === b.dur)
}
