export const REST_TO_REST_MAX_SPEED = 15 / 8
export const REST_TO_REST_MAX_ACCELERATION = 10 / Math.sqrt(3)
/** Unit distance and duration, with zero velocity and acceleration at both ends. */
export function getRestToRestProfile(time: number): { position: number; velocity: number; acceleration: number } | Error {
  if (!Number.isFinite(time)) return new Error("Invalid motion profile time")
  if (time <= 0) return { position: 0, velocity: 0, acceleration: 0 }
  if (time >= 1) return { position: 1, velocity: 0, acceleration: 0 }
  return { position: Math.max(0, Math.min(1, time ** 3 * (10 + time * (-15 + 6 * time)))), velocity: 30 * time ** 2 * (1 - time) ** 2, acceleration: 60 * time * (1 - time) * (1 - 2 * time) }
}
