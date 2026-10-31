import { getStairSectionConnection } from "#/scripts/lib/get-stair-section-connection"
import { getStairSectionFrame } from "#/scripts/lib/get-stair-section-frame"
import { auditStairSectionDimensions } from "#/scripts/lib/audit-stair-section-dimensions"
import { auditStairSectionHeadroom } from "#/scripts/lib/audit-stair-section-headroom"
import { getStairLandingError } from "#/scripts/lib/get-stair-landing-error"
import type { StairSection, StairFloorLevels } from "#/scripts/lib/stair-section-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"

type Props = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; section: StairSection; levels: StairFloorLevels }>
const oppositeEnd: Readonly<Record<"start" | "end", "start" | "end">> = { start: "end", end: "start" }

/** A section has independent connection, physical fit, headroom and landing requirements. */
export function auditStairSection(props: Props): string[] {
  const connection = getStairSectionConnection({ buildingId: props.building.id, section: props.section, documents: props.documents })
  if (connection instanceof Error) return [connection.message]
  const frame = getStairSectionFrame({ section: props.section, levels: props.levels, connection })
  if (frame instanceof Error) return [frame.message]
  const dimensions = { section: props.section, frame, isDesigned: props.building.design_gate === "通過" }
  const lowerLanding = getStairLandingError({
    point: connection.connection.access,
    end: props.section.lower_end,
    rect: connection.stair.rect,
    scale: connection.lower.grid.cell_m,
    along: frame.along,
    landingDepth: props.section.landing_depth_m,
  })
  const upperLanding = getStairLandingError({
    point: connection.connection.target_access,
    end: oppositeEnd[props.section.lower_end],
    rect: connection.upperStair.rect,
    scale: connection.upper.grid.cell_m,
    along: frame.along,
    landingDepth: props.section.landing_depth_m,
  })
  return [...auditStairSectionDimensions(dimensions), ...auditStairSectionHeadroom(dimensions), ...[lowerLanding, upperLanding].filter((error) => error !== null)]
}
