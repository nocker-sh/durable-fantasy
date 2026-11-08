import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { GroundJobState } from "#/world/scene/ground"
const active = new Map<string, GroundJobState>()

import { cacheReads, cacheWrites } from "#/world/scene/ground"

import { paint } from "#/world/scene/helpers/ground/paint"
import { load } from "#/world/scene/helpers/ground/load"
import { keep } from "#/world/scene/helpers/ground/keep"

/** Share loading and painting, including a prefetch promoted to the current map. */
export function obtain(map: string, foreground: boolean): Promise<PixBuf> {
  const existing = active.get(map)
  if (existing) {
    existing.foreground ||= foreground
    return existing.promise
  }
  const saving: { value: Promise<void> } = { value: Promise.resolve() }
  const job: GroundJobState = {
    foreground,
    promise: Promise.resolve()
      .then(async () => {
        const cached = await cacheReads.run(() => load(map), null)
        if (cached) return cached
        const buf = await paint(map, () => job.foreground)
        saving.value = cacheWrites.run(() => keep(map, buf), undefined)
        return buf
      })
      .finally(() => {
        // Display ready pixels immediately, but share them until persistence finishes.
        void saving.value.then(() => {
          if (active.get(map) === job) active.delete(map)
        })
      }),
  }
  active.set(map, job)
  return job.promise
}
