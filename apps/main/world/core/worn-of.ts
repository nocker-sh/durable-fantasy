import type { Stack } from "#/world/core/bag-types"
import type { Worn } from "#/world/core/player-types"

/** 装備へ移すときも品質・作り手・道具の消耗を保持する。 */
export function wornOf(stack: Stack): Worn {
  return { ...(stack.q !== undefined ? { q: stack.q } : {}), ...(stack.by ? { by: stack.by } : {}), ...(stack.dur !== undefined ? { dur: stack.dur } : {}) }
}
