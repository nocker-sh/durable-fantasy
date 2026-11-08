import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import { wallTex } from "#/world/scene/textures/wall-tex"
import type { WallOpts } from "#/world/scene/textures/walls"

/** Painted walls kept across maps, least recently used first; about this many bytes at most. */
const LIMIT = 64 * 1024 * 1024
const kept = new Map<string, readonly [PixelBuffer, PixelBuffer | null]>()
const size = { value: 0 }

const bytes = (painted: readonly [PixelBuffer, PixelBuffer | null]) => painted[0].data.byteLength + (painted[1]?.data.byteLength ?? 0)

/**
 * 壁の絵は同じ注文なら毎回同じ絵になるので、マップを出入りするたびに描き直さず覚えておく。
 * 返す絵は読むだけにする(テクスチャ同士で共有される)。
 */
export function keptWallTex(o: WallOpts): readonly [PixelBuffer, PixelBuffer | null] {
  const key = JSON.stringify(o)
  const hit = kept.get(key)
  if (hit) {
    kept.delete(key)
    kept.set(key, hit)
    return hit
  }
  const painted = wallTex(o)
  kept.set(key, painted)
  size.value += bytes(painted)
  for (const [oldest, value] of kept) {
    if (size.value <= LIMIT || oldest === key) break
    kept.delete(oldest)
    size.value -= bytes(value)
  }
  return painted
}
