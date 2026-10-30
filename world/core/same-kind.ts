import type { Stack } from "#/world/core/bag-types"

/** 品質と作り手も一致する品だけを同じ積み重ねとして扱う。 */
export function sameKind(a: Stack, b: Stack): boolean {
  return a.item === b.item && a.q === b.q && a.by === b.by
}
