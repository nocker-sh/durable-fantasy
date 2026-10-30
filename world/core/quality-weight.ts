import { QUALITY_EFFECT } from "#/world/core/items/kinds"
import type { Quality } from "#/world/core/items/kinds"

/** 製作済みの材料の品質を、製作結果へ反映する重みにする。 */
export function qualityWeight(quality: Quality | undefined): number {
  if (quality === undefined) return 1
  if (QUALITY_EFFECT[quality] >= 1.2) return quality === 3 ? 3 : 2
  if (quality === 0) return 0

  return 1
}
