import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import { roofBounds } from "#/scripts/lib/roof-bounds"
type HouseFootprint = { id: string; map: string; x0: number; z0: number; x1: number; z1: number }
/** Project the complete proposal together; never mix a moved house with its former roof. */
type Props<T extends HouseFootprint> = {
  houses: readonly T[]
  documents: ReadonlyMap<string, SettingDocument>
  metresPerTile: number
  includeRoofs?: boolean
}
export function plannedBuildingFootprints<T extends HouseFootprint>(props: Props<T>): T[] {
  const houses = props.houses
  const documents = props.documents
  const metresPerTile = props.metresPerTile
  const includeRoofs = props.includeRoofs === undefined ? false : props.includeRoofs

  return houses.map((house) => {
    const document = documents.get(`building-${house.id}`)
    const wall = document?.site_plan ? auditBuildingSite({ building: document, houses: [], metresPerTile: metresPerTile, roads: [] }).bounds : undefined
    const bounds = includeRoofs && document ? (roofBounds(document, metresPerTile) ?? wall) : wall
    return bounds ? { ...house, x0: bounds[0], z0: bounds[1], x1: bounds[2], z1: bounds[3] } : { ...house }
  })
}
