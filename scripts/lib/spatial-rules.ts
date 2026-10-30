/** Settings design thresholds; these do not certify building safety or replace runtime movement rules. */
export const MIN_PASSAGE_WIDTH_M = 0.8
export const MIN_OPERATING_SIDE_M = 0.8
export const MIN_BED_LENGTH_M = 2
export const MIN_BED_WIDTH_M = 0.8
export const MAX_STAIR_RISER_M = 0.2
export const MIN_STAIR_GOING_M = 0.25
export const MIN_STANDING_HEADROOM_M = 2
export const MIN_STAIR_HEADROOM_M = MIN_STANDING_HEADROOM_M
export const MAX_HAND_REACH_M = 0.8

/** Seated bodies still need room even when every named chair touches a table. */
export function crowdedSeatCentres(rectangles: readonly number[][], cellM: number): boolean {
  for (let i = 0; i < rectangles.length; i++)
    for (let j = i + 1; j < rectangles.length; j++) {
      const a = rectangles[i],
        b = rectangles[j]
      if (Math.hypot(a[0] + a[2] / 2 - b[0] - b[2] / 2, a[1] + a[3] / 2 - b[1] - b[3] / 2) * cellM + 1e-9 < MIN_PASSAGE_WIDTH_M) return true
    }
  return false
}
