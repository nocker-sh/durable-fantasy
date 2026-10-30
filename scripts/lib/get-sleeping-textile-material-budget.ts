import { getTextileMaterialBudget } from "#/world/town/get-textile-material-budget"
import type { SleepingTextileCutting } from "#/scripts/lib/sleeping-textile-cutting"

/** Cut areas come from the same checked panels as the layout, including seam stock but excluding the auxiliary axis. */
export function getSleepingTextileMaterialBudget(cutting: SleepingTextileCutting) {
  const source = cutting.source.material_budget,
    cutAreaM2 = cutting.cuts.reduce((area, cut) => {
      if (cut.size.length === 3) return area + cut.size[0] * cut.size[2]
      return area + cut.size[0] * cut.size[1]
    }, 0)

  return getTextileMaterialBudget({
    clothAreaM2: cutting.source.width_m * cutting.source.length_m,
    cutAreaM2,
    arealMassGPerM2: source.areal_mass_g_per_m2,
    prepareYieldPermille: source.prepare_yield_permille,
    spinYieldPermille: source.spin_yield_permille,
    weaveYieldPermille: source.weave_yield_permille,
  })
}
