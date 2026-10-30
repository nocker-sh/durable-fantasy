import { WINDMILL_ROTOR_SHAPE } from "#/world/scene/construction/windmill-rotor-shape"
import { getWindmillRotorSweep } from "#/world/scene/construction/get-windmill-rotor-sweep"
import { TILE_M } from "#/world/town/fit"
import type { z } from "zod"
import type { windmillYardSchema } from "#/scripts/lib/windmill-yard-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ document: SettingDocument; plan: z.infer<typeof windmillYardSchema> }>

/** Keep the complete native rotor's horizontal projection and declared gap inside the reserved boundary cells. */
export function getWindmillYardRotorError(props: Props): Error | null {
  const sweep = getWindmillRotorSweep({ shape: WINDMILL_ROTOR_SHAPE })
  if (sweep instanceof Error) return sweep
  const machine = props.document.furniture?.find((piece) => piece.symbol === props.plan.machine),
    grid = props.document.grid
  if (!machine || !grid) return new Error("Windmill rotor has no machine reservation")
  const review = props.plan.rotor_review,
    area = props.plan.enclosure_rect,
    cell = grid.cell_m,
    bounds = sweep.bounds
  const centre = [(machine.rect[0] + machine.rect[2] / 2) * cell, (machine.rect[1] + machine.rect[3] / 2) * cell]
  if (review.ground_m + bounds.bottom * TILE_M < 0) return new Error("Windmill rotor sweep reaches below the proposed ground")
  if (
    centre[0] + bounds.x0 * TILE_M - review.clearance_m < (area[0] + 1) * cell ||
    centre[0] + bounds.x1 * TILE_M + review.clearance_m > (area[0] + area[2] - 1) * cell ||
    centre[1] + bounds.z0 * TILE_M - review.clearance_m < (area[1] + 1) * cell ||
    centre[1] + bounds.z1 * TILE_M + review.clearance_m > (area[1] + area[3] - 1) * cell
  )
    return new Error("Complete windmill rotor sweep leaves the enclosed reservation")
  return null
}
