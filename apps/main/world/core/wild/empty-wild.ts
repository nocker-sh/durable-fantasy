import type { WildState } from "#/world/core/wild/types"

export function emptyWild(): WildState {
  return { hp: {}, back: {}, by: {} }
}
