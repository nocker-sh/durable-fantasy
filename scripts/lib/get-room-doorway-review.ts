import { getGridBoundaryOpening } from "#/scripts/lib/get-grid-boundary-opening"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"

type Props = Readonly<{ rows: readonly string[]; door: readonly number[]; span: number; cellMetres: number }>
type Review = Readonly<{ errors: readonly string[]; opening: NonNullable<ReturnType<typeof getGridBoundaryOpening>> | null }>

/** Inventory and route audits share the same bounded opening and physical-width checks. */
export function getRoomDoorwayReview(props: Props): Review {
  const errors: string[] = [],
    isHorizontal = props.door[1] === 0 || props.door[1] === props.rows.length - 1

  if (!isHorizontal && props.door[0] !== 0 && props.door[0] !== (props.rows[0]?.length ?? 0) - 1) errors.push("doorway is not on the room boundary")
  if (!Number.isSafeInteger(props.span) || props.span <= 0 || props.span * props.cellMetres < MIN_PASSAGE_WIDTH_M)
    return { errors: [...errors, "doorway is narrower than design minimum"], opening: null }
  if (!Number.isFinite(props.span * props.cellMetres)) return { errors: [...errors, "doorway physical width is not finite"], opening: null }

  const opening = getGridBoundaryOpening(props)
  if (!opening) return { errors: [...errors, "doorway footprint disagrees with grid"], opening: null }

  return { errors, opening }
}
