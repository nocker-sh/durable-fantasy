import { sameStack } from "#/world/core/same-stack"
import type { Stack } from "#/world/core/bag-types"

/** 提示した順序と個数・品質・作り手・消耗を含めて比較する。 */
export function sameStacks(a: readonly Stack[], b: readonly Stack[]): boolean {
  return a.length === b.length && a.every((stack, index) => sameStack(stack, b[index]))
}
