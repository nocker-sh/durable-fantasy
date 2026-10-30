import { parseTime } from "#/world/core/parse-time"
import type { Slot } from "#/world/town/routines"

type Props = Omit<Slot, "from"> & Readonly<{ from: string }>

/** Authored schedule errors must fail at loading, before invalid times can select another activity. */
export function createRoutineSlot(props: Props): Slot {
  const from = parseTime(props.from)
  if (from === null) throw new RangeError("Invalid routine start time")

  return { ...props, from }
}
