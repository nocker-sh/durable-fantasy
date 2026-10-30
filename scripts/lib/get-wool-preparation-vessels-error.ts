import { getRectangularLiquidCapacity } from "#/world/town/get-rectangular-liquid-capacity"
import type { z } from "zod"
import type { woolPreparationSchema } from "#/scripts/lib/wool-preparation-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ facility: SettingDocument; plan: z.infer<typeof woolPreparationSchema> }>

/** Validate every wet station against its own water allocation and grid footprint, not the storage tank's capacity. */
export function getWoolPreparationVesselsError(props: Props): Error | null {
  const water = props.plan.water_budget,
    required = { supply: water.supply_ml, wash: water.wash_ml, rinse: water.rinse_ml, handwash: water.handwash_ml, effluent: water.effluent_ml }
  for (const station of ["supply", "wash", "rinse", "handwash", "effluent"] satisfies (keyof typeof required)[]) {
    const vessel = props.plan.vessels[station],
      piece = props.facility.furniture?.find((piece) => piece.symbol === props.plan.stations[station])
    const capacity = getRectangularLiquidCapacity({
      innerMm: vessel.inner_mm,
      wallMm: vessel.wall_mm,
      bottomMm: vessel.bottom_mm,
      freeboardMm: vessel.freeboard_mm,
      displacementMl: vessel.displacement_ml,
    })
    if (capacity instanceof Error) return capacity
    if (!piece || !props.facility.grid || capacity.outerMm[0] / 1000 > piece.rect[2] * props.facility.grid.cell_m || capacity.outerMm[2] / 1000 > piece.rect[3] * props.facility.grid.cell_m)
      return new Error("Wool vessel exceeds its station footprint")
    if (capacity.capacityMl < required[station]) return new Error("Wool vessel working capacity is smaller than its reserved water")
    if ((station === "wash" || station === "rinse") && vessel.displacement_ml <= 0) return new Error("Wool basin has no allowance for immersed fleece")
  }

  return null
}
