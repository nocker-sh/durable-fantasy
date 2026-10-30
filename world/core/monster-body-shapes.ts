export const SLIME_BODY_RADIUS = 0.26
export const SLIME_MOVING_SQUASH = 0.07
export const SLIME_RESTING_SQUASH = 0.035
export type HareBodyPart = { dimensions: readonly [number, number, number]; position: readonly [number, number, number]; material: "fur" | "pale" | "eyes"; castsShadow: boolean }
/** Preserve construction order so batching retains the original geometry, materials and shadows. */
export const HARE_BODY_PARTS: ReadonlyArray<HareBodyPart> = [
  { dimensions: [0.025, 0.13, 0.04], position: [-0.03, 0.28, 0.12], material: "fur", castsShadow: false },
  { dimensions: [0.025, 0.13, 0.04], position: [0.03, 0.28, 0.12], material: "fur", castsShadow: false },
  { dimensions: [0.012, 0.025, 0.025], position: [-0.056, 0.19, 0.17], material: "eyes", castsShadow: false },
  { dimensions: [0.012, 0.025, 0.025], position: [0.056, 0.19, 0.17], material: "eyes", castsShadow: false },
  { dimensions: [0.16, 0.14, 0.26], position: [0, 0.09, 0], material: "fur", castsShadow: true },
  { dimensions: [0.11, 0.11, 0.12], position: [0, 0.17, 0.14], material: "fur", castsShadow: false },
  { dimensions: [0.06, 0.06, 0.05], position: [0, 0.12, -0.14], material: "pale", castsShadow: false },
]
