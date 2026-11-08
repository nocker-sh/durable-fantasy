import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

type Props = Readonly<{ level: AuthoredPlan["floorLevels"][number]; below: AuthoredPlan["floorLevels"][number] | null }>

/** Both faces of the floor must remain representable, and the underside must meet the lower ceiling. */
export function isAuthoredFloorLevelValid(props: Props): boolean {
  const level = props.level,
    underside = level.elevation - level.thickness,
    height = level.ceiling - level.elevation

  if (![level.elevation, level.ceiling, level.thickness, underside, height].every(Number.isFinite) || level.ceiling <= level.elevation || level.thickness <= 0 || underside >= level.elevation)
    return false
  if (!props.below) return level.floor === 0

  const expectedElevation = props.below.ceiling + level.thickness
  return (
    Number.isFinite(expectedElevation) &&
    Math.abs(level.elevation - props.below.ceiling - level.thickness) <= 1e-9 &&
    Math.abs(level.elevation - expectedElevation) <= 1e-9 &&
    Math.abs(underside - props.below.ceiling) <= 1e-9
  )
}
