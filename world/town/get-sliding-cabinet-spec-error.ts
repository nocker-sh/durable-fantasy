import type { SlidingCabinetSpec } from "#/world/town/sliding-cabinet-types"

/** Invalid or degenerate tracks never become a usable storage cavity. */
export function getSlidingCabinetSpecError(spec: SlidingCabinetSpec): Error | null {
  const b = spec.bounds,
    values = [b.x0, b.x1, b.z0, b.z1, b.bottom, b.top, spec.storageFloor, spec.board, spec.legWidth, spec.panel, spec.guide, spec.overlap, spec.rearTravel, ...Object.values(spec.pull)]
  if (!values.every(Number.isFinite) || b.bottom < 0 || b.x0 >= b.x1 || b.z0 >= b.z1) return new Error("Invalid sliding cabinet dimensions")
  if (
    [spec.board, spec.legWidth, spec.panel, spec.guide, spec.overlap, spec.pull.width, spec.pull.height, spec.pull.fromMeeting, spec.pull.southFromMeeting, spec.pull.southWidth, spec.rearTravel].some(
      (value) => value <= 0,
    )
  )
    return new Error("Invalid sliding cabinet boards or pull")
  const depth = b.x1 - b.x0 - spec.board - 2 * spec.panel - 3 * spec.guide,
    width = b.z1 - b.z0 - 2 * spec.board,
    leaf = (width + spec.overlap) / 2
  if (depth <= 0 || width <= spec.overlap || spec.storageFloor - spec.board <= b.bottom || spec.storageFloor + 2 * spec.guide >= b.top - spec.board)
    return new Error("Sliding cabinet has no supported cavity or tracks")
  if (spec.legWidth * 2 >= Math.min(b.x1 - b.x0, b.z1 - b.z0) || spec.pull.fromMeeting <= spec.pull.width / 2 || spec.pull.fromMeeting + spec.pull.width / 2 >= leaf)
    return new Error("Sliding cabinet legs or pull leave their boards")
  if (
    spec.rearTravel > width - leaf ||
    spec.pull.southFromMeeting <= spec.pull.southWidth / 2 ||
    spec.pull.southFromMeeting + spec.pull.southWidth / 2 >= leaf ||
    width - leaf + spec.pull.southFromMeeting - spec.rearTravel - spec.pull.southWidth / 2 <= leaf
  )
    return new Error("Rear finger pull is concealed by the front leaf")
  if (spec.pull.bottom <= spec.storageFloor + spec.guide || spec.pull.bottom + spec.pull.height >= b.top - spec.board - spec.guide) return new Error("Sliding cabinet pull enters a guide")

  return null
}
