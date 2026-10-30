import type { SeatSpec } from "#/world/town/room-fixtures"

/** Parse the physical dimensions once for both document audits and runtime exports. */
export function seatDimensions(value: unknown, width: number, depth: number): SeatSpec {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Missing chair dimensions")
  const source = value as Record<string, unknown>
  const fields = ["width_m", "depth_m", "height_m", "back_height_m", "board_thickness_m", "leg_width_m"] as const
  if (!fields.every((field) => typeof source[field] === "number" && Number.isFinite(source[field]) && Number(source[field]) > 0)) {
    throw new Error("Invalid chair dimensions")
  }
  const seat: SeatSpec = {
    width: Number(source.width_m),
    depth: Number(source.depth_m),
    height: Number(source.height_m),
    backHeight: Number(source.back_height_m),
    boardThickness: Number(source.board_thickness_m),
    legWidth: Number(source.leg_width_m),
  }
  if (source.facing !== undefined) {
    if (source.facing !== "n" && source.facing !== "s" && source.facing !== "w" && source.facing !== "e") throw new Error("Invalid chair facing")
    seat.facing = source.facing
  }
  const across = seat.facing === "e" || seat.facing === "w"
  if (
    ![width, depth].every((n) => Number.isFinite(n) && n > 0) ||
    seat.width > (across ? depth : width) ||
    seat.depth > (across ? width : depth) ||
    seat.height <= seat.boardThickness ||
    seat.backHeight <= seat.height ||
    seat.legWidth * 2 >= Math.min(seat.width, seat.depth)
  ) {
    throw new Error("Invalid chair dimensions")
  }
  if (source.occupant_forward_m !== undefined) {
    const forward = source.occupant_forward_m
    if (typeof forward !== "number" || !Number.isFinite(forward) || forward < 0 || forward >= seat.depth / 2) throw new Error("Invalid chair occupant position")
    seat.occupantForward = forward
  }
  if (source.foot_rest !== undefined) {
    const rest = source.foot_rest as Record<string, unknown> | null
    if (
      !rest ||
      typeof rest !== "object" ||
      !["height_m", "width_m", "depth_m", "forward_m", "thickness_m"].every((key) => typeof rest[key] === "number" && Number.isFinite(rest[key]) && Number(rest[key]) > 0)
    )
      throw new Error("Invalid chair foot rest")
    seat.footRest = { height: Number(rest.height_m), width: Number(rest.width_m), depth: Number(rest.depth_m), forward: Number(rest.forward_m), thickness: Number(rest.thickness_m) }
    const foot = seat.footRest
    if (foot.height <= foot.thickness || foot.height >= seat.height - seat.boardThickness || foot.width > (across ? depth : width) || foot.width < seat.width - 2 * seat.legWidth)
      throw new Error("Invalid chair foot rest")
  }
  return seat
}
