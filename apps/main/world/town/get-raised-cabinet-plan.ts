import { getSlidingCabinetPlan } from "#/world/town/get-sliding-cabinet-plan"
import { getRaisedCabinetLeafParts } from "#/world/town/get-raised-cabinet-leaf-parts"
import { getRaisedCabinetLeafSweepError } from "#/world/town/get-raised-cabinet-leaf-sweep-error"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { SlidingCabinetSpec } from "#/world/town/sliding-cabinet-types"
import type { RaisedCabinetHandleSpec } from "#/world/town/raised-cabinet-handle-types"
type Props = Readonly<{ spec: SlidingCabinetSpec; handle: RaisedCabinetHandleSpec; obstacles: readonly Cuboid[] }>

/** Solid panels and attached handles share complete sweeps; the other handle and all posts remain real obstacles. */
export function getRaisedCabinetPlan(props: Props) {
  const base = getSlidingCabinetPlan({ spec: props.spec, contents: props.obstacles }),
    h = props.handle
  if (base instanceof Error) return base
  if (
    ![h.northTravel, h.northFromMeeting, h.southFromMeeting, h.centreY, h.height, h.standOff, h.thickness].every((value) => Number.isFinite(value) && value > 0) ||
    h.northTravel > base.travel.north + 1e-12 ||
    h.height <= 2 * h.thickness ||
    h.standOff <= h.thickness
  )
    return new Error("Invalid raised cabinet handle")
  const travel = { north: h.northTravel, south: base.travel.south }
  const closed = { north: getRaisedCabinetLeafParts({ ...props, leaf: "north", offset: 0 }), south: getRaisedCabinetLeafParts({ ...props, leaf: "south", offset: 0 }) },
    opposite = { north: closed.south, south: closed.north },
    direction = { north: 1, south: -1 }

  for (const leaf of ["north", "south"] satisfies ("north" | "south")[]) {
    const parts = closed[leaf],
      panel = parts.panel,
      bar = parts.bar
    if (bar.z0 <= panel.z0 || bar.z1 >= panel.z1 || bar.bottom <= panel.bottom + props.spec.guide || bar.top >= panel.top - props.spec.guide)
      return new Error("Raised handle leaves its supporting panel")
    const sweep = getRaisedCabinetLeafSweepError({ parts: parts.all, obstacles: [...base.fixed, ...opposite[leaf].all, ...props.obstacles], offset: [0, 0, direction[leaf] * travel[leaf]] })
    if (sweep) return sweep
  }

  return {
    fixed: base.fixed,
    travel,
    closed,
    open: { north: getRaisedCabinetLeafParts({ ...props, leaf: "north", offset: travel.north }), south: getRaisedCabinetLeafParts({ ...props, leaf: "south", offset: -travel.south }) },
  }
}
