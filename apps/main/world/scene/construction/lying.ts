import { Kit } from "#/world/scene/construction/kit"
import { LYING } from "#/world/scene/construction/belonging-builders"

/** Draws what a trace's name says; false when nothing fits it. */
export function lying(k: Kit, name: string, seed: number): boolean {
  const hit = LYING.find((entry) => {
    const re = entry[0]
    return re.test(name)
  })
  if (!hit) return false
  hit[1](k, seed, name)
  return true
}
