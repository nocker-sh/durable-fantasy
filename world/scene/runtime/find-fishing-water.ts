import { inRect } from "#/lib/engine/in-rect"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import type { V2 } from "#/world/scene/construction/registry"

type Props = Readonly<{
  at: V2
  bridge: { x0: number; z0: number; x1: number; z1: number }
  heightAt(x: number, z: number): number
  waterHeight: number
}>
const steps = getIntegerRange(0, 8)

/** The interaction stays on the bank; the ripple uses the first open-water candidate. */
export function findFishingWater(props: Props): V2 {
  for (const radius of [0.5, 1, 1.5, 2])
    for (const step of steps) {
      const point: V2 = [props.at[0] + Math.cos((step * Math.PI) / 4) * radius, props.at[1] + Math.sin((step * Math.PI) / 4) * radius]
      if (!inRect({ x: point[0], z: point[1], r: props.bridge, pad: 0.8 }) && props.heightAt(point[0], point[1]) < props.waterHeight) return point
    }
  return props.at
}
