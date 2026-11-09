import type { WebGLRenderer } from "three"

/** At most this many shader programs outlive the map that compiled them. */
const KEPT_PROGRAMS = 256

const kept = new WeakSet<object>()
const keptCount = new WeakMap<WebGLRenderer, number>()

/** Keep the compiled shader programs of a map being left, so materials alike on the next map link at once. */
export function keepPrograms(renderer: WebGLRenderer): void {
  let count = keptCount.get(renderer) ?? 0
  for (const program of renderer.info.programs ?? []) {
    if (count >= KEPT_PROGRAMS) break
    if (kept.has(program)) continue
    // shader materials are made afresh for each map and three.js renumbers their shader stages, so their programs never
    // match again; their cache key starts with those stage numbers, where a built-in material's starts with its shader id
    if (/^\d/.test(program.cacheKey)) continue
    kept.add(program)
    count++
    // three.js destroys a program when its last material lets go; one extra use keeps it cached
    program.usedTimes++
  }
  keptCount.set(renderer, count)
}
