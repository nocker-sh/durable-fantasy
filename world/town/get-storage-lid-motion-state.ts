import { storageLidPartsAtOffset } from "#/world/town/storage-lid-parts-at-offset"
import type { StorageLidPlan } from "#/world/town/storage-lid"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = { plan: StorageLidPlan; segment: number; progress: number }

/** Interpolate one certified board segment with exact endpoint weights; this says nothing about the actor's support or gait. */
export function getStorageLidMotionState(props: Props) {
  if (!Number.isInteger(props.segment) || props.segment < 0 || props.segment >= props.plan.offsets.length - 1 || !Number.isFinite(props.progress) || props.progress < 0 || props.progress > 1)
    return new Error("Invalid storage lid motion progress")
  const from = props.plan.offsets[props.segment],
    to = props.plan.offsets[props.segment + 1]
  if (![...from, ...to].every(Number.isFinite)) return new Error("Invalid storage lid motion segment")
  const offset: Point3 = [from[0] * (1 - props.progress) + to[0] * props.progress, from[1] * (1 - props.progress) + to[1] * props.progress, from[2] * (1 - props.progress) + to[2] * props.progress]

  return { offset, parts: storageLidPartsAtOffset({ plan: props.plan, offset }) }
}
