import type { StairSection, StairFloorLevels, StairSectionConnection } from "#/scripts/lib/stair-section-types"

type Props = Readonly<{ section: StairSection; levels: StairFloorLevels; connection: StairSectionConnection }>

/** Keep finite physical dimensions and floor heights separate from passage and headroom policy. */
export function getStairSectionFrame(props: Props) {
  const lowerLevel = props.levels.find((level) => level.floor === props.connection.lower.floor),
    upperLevel = props.levels.find((level) => level.floor === props.connection.upper.floor)
  if (!lowerLevel || !upperLevel || upperLevel.elevation_m <= lowerLevel.elevation_m) return new Error("Stair section has no increasing floor elevations")

  const along: 0 | 1 = props.section.axis === "x" ? 0 : 1
  const length = props.connection.stair.rect[2 + along] * props.connection.lower.grid.cell_m,
    width = props.connection.stair.rect[3 - along] * props.connection.lower.grid.cell_m
  const upperLength = props.connection.upperStair.rect[2 + along] * props.connection.upper.grid.cell_m,
    upperWidth = props.connection.upperStair.rect[3 - along] * props.connection.upper.grid.cell_m
  if (![length, width, upperLength, upperWidth, upperLevel.elevation_m - lowerLevel.elevation_m].every(Number.isFinite)) return new Error("Stair section has nonfinite physical dimensions")

  return {
    along,
    length,
    width,
    bottom: lowerLevel.elevation_m,
    top: upperLevel.elevation_m,
    lowerCeiling: lowerLevel.ceiling_elevation_m ?? null,
    upperCeiling: upperLevel.ceiling_elevation_m ?? null,
  }
}
