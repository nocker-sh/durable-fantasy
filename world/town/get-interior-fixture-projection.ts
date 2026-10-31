import { projectInteriorWindow } from "#/world/town/project-interior-window"
import { projectInteriorLamp } from "#/world/town/project-interior-lamp"
import { projectInteriorFlue } from "#/world/town/project-interior-flue"
import type { FloorPlan, Rect } from "#/world/town/floorplan/types"

type Props = Readonly<{ plan: Pick<FloorPlan, "windows" | "lamps" | "flues" | "cellSize">; floor: number; bounds: Rect; scale: number }>

/** Windows and lamps belong to their floor; the shared flue retains its full section on both floors. */
export function getInteriorFixtureProjection(props: Props) {
  const plan = props.plan,
    bounds = props.bounds
  const windows = plan.windows?.filter((window) => window.floor === props.floor).map((window) => projectInteriorWindow({ window, bounds, scale: props.scale, wallMetres: plan.cellSize }))
  const lamps = plan.lamps?.filter((lamp) => lamp.floor === props.floor).map((lamp) => projectInteriorLamp({ lamp, x0: bounds.x0, z0: bounds.z0, scale: props.scale }))
  const flues = plan.flues?.map((section) => projectInteriorFlue({ section, x0: bounds.x0, z0: bounds.z0, scale: props.scale }))
  return { windows, lamps, flues }
}
