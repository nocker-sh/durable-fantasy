/** Blend along the shortest turn, preserving the sign of an exact half-turn. */
export function blendHeading(from: number, to: number, weight: number): number {
  const difference = { value: to - from }
  while (difference.value > Math.PI) difference.value -= Math.PI * 2
  while (difference.value < -Math.PI) difference.value += Math.PI * 2
  return from + difference.value * weight
}
