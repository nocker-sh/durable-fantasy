import type { Quality } from "#/world/core/items/kinds"
export function isQuality(value: number): value is Quality {
  return value === 0 || value === 1 || value === 2 || value === 3
}
