import { siteTransform } from "#/scripts/lib/site-transform"
import type { z } from "zod"
import type { windmillYardSiteSchema } from "#/scripts/lib/windmill-yard-site-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ grid: NonNullable<SettingDocument["grid"]>; site: z.infer<typeof windmillYardSiteSchema>; metresPerTile: number }>

/** The entire authored yard projects to one shared outdoor footprint, independently of the existing exterior. */
export function getWindmillYardSiteGeometry(props: Props) {
  const grid = props.grid,
    site = props.site,
    scale = props.metresPerTile
  if (
    !Number.isFinite(scale) ||
    scale <= 0 ||
    !Number.isFinite(grid.cell_m) ||
    grid.cell_m <= 0 ||
    !grid.rows.length ||
    !grid.rows[0].length ||
    grid.rows.some((row) => row.length !== grid.rows[0].length) ||
    !site.origin_tiles.every(Number.isFinite) ||
    ![0, 1, 2, 3].includes(site.rotation_quarters)
  )
    return new Error("Invalid windmill site transform")
  const transform = siteTransform((grid.rows[0].length * grid.cell_m) / scale, (grid.rows.length * grid.cell_m) / scale, site.rotation_quarters)
  const bounds = [site.origin_tiles[0], site.origin_tiles[1], site.origin_tiles[0] + transform.size[0], site.origin_tiles[1] + transform.size[1]] satisfies readonly [number, number, number, number]
  if (!bounds.every(Number.isFinite)) return new Error("Unbounded windmill site footprint")
  return { bounds }
}
