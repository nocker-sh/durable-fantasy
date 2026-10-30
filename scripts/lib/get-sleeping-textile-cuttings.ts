import { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
import { getBlanketCuttingReview } from "#/scripts/lib/get-blanket-cutting-review"
import { getPillowCoverCuttingReview } from "#/scripts/lib/get-pillow-cover-cutting-review"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { SleepingTextileCutting } from "#/scripts/lib/sleeping-textile-cutting"

/** Resolve every declared bed-textile cutting plan before following any supplier allocation. */
export function getSleepingTextileCuttings(room: SettingDocument): readonly SleepingTextileCutting[] | Error {
  const materials = sleepingMaterialsSchema.safeParse(room.sleeping_materials)
  if (!materials.success) return new Error("Missing sleeping textile materials")
  const cuttings: SleepingTextileCutting[] = []

  if (materials.data.blanket_cutting) {
    const cutting = getBlanketCuttingReview(room)
    if (cutting instanceof Error) return cutting
    cuttings.push(cutting)
  }
  if (materials.data.pillow_cover_cutting) {
    const cutting = getPillowCoverCuttingReview(room)
    if (cutting instanceof Error) return cutting
    cuttings.push(cutting)
  }

  return cuttings
}
